-- ================================================
-- BOLÃO COPA DO MUNDO 2026 — Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ================================================

-- Habilita UUID
create extension if not exists "uuid-ossp";

-- ------------------------------------------------
-- TABELA: perfis de usuário
-- ------------------------------------------------
create table public.perfis (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  avatar_url text,
  email text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table public.perfis enable row level security;

create policy "Perfis visíveis para todos autenticados"
  on public.perfis for select
  using (auth.role() = 'authenticated');

create policy "Usuário atualiza próprio perfil"
  on public.perfis for update
  using (auth.uid() = id);

-- ------------------------------------------------
-- TABELA: jogos
-- ------------------------------------------------
create table public.jogos (
  id uuid default uuid_generate_v4() primary key,
  fase text not null, -- 'grupos', 'oitavas', 'quartas', 'semis', 'terceiro', 'final'
  grupo text, -- 'A', 'B', ... (só para fase de grupos)
  time_casa text not null,
  time_fora text not null,
  bandeira_casa text, -- código do país ex: 'BR'
  bandeira_fora text,
  data_hora timestamptz not null,
  gols_casa integer,
  gols_fora integer,
  encerrado boolean default false,
  ordem integer default 0,
  created_at timestamptz default now()
);

alter table public.jogos enable row level security;

create policy "Jogos visíveis para todos autenticados"
  on public.jogos for select
  using (auth.role() = 'authenticated');

create policy "Somente admin atualiza jogos"
  on public.jogos for all
  using (
    exists (
      select 1 from public.perfis
      where id = auth.uid() and is_admin = true
    )
  );

-- ------------------------------------------------
-- TABELA: palpites
-- ------------------------------------------------
create table public.palpites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.perfis(id) on delete cascade not null,
  jogo_id uuid references public.jogos(id) on delete cascade not null,
  gols_casa integer not null check (gols_casa >= 0),
  gols_fora integer not null check (gols_fora >= 0),
  pontos integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, jogo_id)
);

alter table public.palpites enable row level security;

create policy "Usuário vê próprios palpites antes do jogo, todos depois"
  on public.palpites for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.jogos
      where id = jogo_id and data_hora < now()
    )
  );

create policy "Usuário insere próprio palpite antes do jogo começar"
  on public.palpites for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.jogos
      where id = jogo_id and data_hora > now() and not encerrado
    )
  );

create policy "Usuário atualiza próprio palpite antes do jogo começar"
  on public.palpites for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.jogos
      where id = jogo_id and data_hora > now() and not encerrado
    )
  );

-- ------------------------------------------------
-- TABELA: ranking (view materializada como tabela)
-- Atualizada via trigger quando palpites são pontuados
-- ------------------------------------------------
create table public.ranking (
  user_id uuid references public.perfis(id) on delete cascade primary key,
  total_pontos integer default 0,
  acertos_exatos integer default 0,
  acertos_resultado integer default 0,
  jogos_palpitados integer default 0,
  updated_at timestamptz default now()
);

alter table public.ranking enable row level security;

create policy "Ranking visível para todos autenticados"
  on public.ranking for select
  using (auth.role() = 'authenticated');

-- ------------------------------------------------
-- FUNÇÃO: cria perfil automaticamente no cadastro
-- ------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.perfis (id, nome, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );

  insert into public.ranking (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------
-- FUNÇÃO: calcula pontos ao encerrar jogo
-- ------------------------------------------------
create or replace function public.calcular_pontos(jogo_id_param uuid)
returns void language plpgsql security definer
as $$
declare
  jogo record;
  palpite record;
  pts integer;
  resultado_jogo text;
  resultado_palpite text;
begin
  select * into jogo from public.jogos where id = jogo_id_param;

  if jogo is null or not jogo.encerrado then
    return;
  end if;

  resultado_jogo := case
    when jogo.gols_casa > jogo.gols_fora then 'casa'
    when jogo.gols_fora > jogo.gols_casa then 'fora'
    else 'empate'
  end;

  for palpite in
    select * from public.palpites where jogo_id = jogo_id_param
  loop
    resultado_palpite := case
      when palpite.gols_casa > palpite.gols_fora then 'casa'
      when palpite.gols_fora > palpite.gols_casa then 'fora'
      else 'empate'
    end;

    if palpite.gols_casa = jogo.gols_casa and palpite.gols_fora = jogo.gols_fora then
      pts := 3; -- placar exato
    elsif resultado_palpite = resultado_jogo then
      pts := 1; -- acertou o vencedor/empate
    else
      pts := 0;
    end if;

    update public.palpites
    set pontos = pts, updated_at = now()
    where id = palpite.id;

    -- Atualiza ranking
    insert into public.ranking (user_id, total_pontos, acertos_exatos, acertos_resultado, jogos_palpitados)
    values (
      palpite.user_id,
      pts,
      case when pts = 3 then 1 else 0 end,
      case when pts >= 1 then 1 else 0 end,
      1
    )
    on conflict (user_id) do update set
      total_pontos = ranking.total_pontos + excluded.total_pontos,
      acertos_exatos = ranking.acertos_exatos + excluded.acertos_exatos,
      acertos_resultado = ranking.acertos_resultado + excluded.acertos_resultado,
      jogos_palpitados = ranking.jogos_palpitados + excluded.jogos_palpitados,
      updated_at = now();
  end loop;
end;
$$;

-- ------------------------------------------------
-- REALTIME: habilita para tabelas principais
-- ------------------------------------------------
alter publication supabase_realtime add table public.jogos;
alter publication supabase_realtime add table public.ranking;
alter publication supabase_realtime add table public.palpites;
