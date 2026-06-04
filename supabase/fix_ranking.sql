-- ================================================
-- FIX RANKING: recalculo completo + trigger de palpites
-- ================================================

-- 1. Trigger para atualizar jogos_palpitados quando usuário faz/remove palpite
create or replace function public.update_palpites_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.ranking (user_id, jogos_palpitados)
    values (NEW.user_id, 1)
    on conflict (user_id) do update set
      jogos_palpitados = ranking.jogos_palpitados + 1,
      updated_at = now();

  elsif TG_OP = 'DELETE' then
    update public.ranking set
      jogos_palpitados = greatest(jogos_palpitados - 1, 0),
      updated_at = now()
    where user_id = OLD.user_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists on_palpite_insert on public.palpites;
create trigger on_palpite_insert
  after insert or delete on public.palpites
  for each row execute procedure public.update_palpites_count();

-- 2. Função principal: recalcula ranking do zero a partir dos palpites
create or replace function public.calcular_pontos(jogo_id_param uuid)
returns void language plpgsql security definer
as $$
declare
  jogo record;
  palpite record;
  pts integer;
  pts_exato integer;
  pts_vencedor integer;
  pts_invertido integer;
  resultado_jogo text;
  resultado_palpite text;
begin
  select * into jogo from public.jogos where id = jogo_id_param;
  if jogo is null or not jogo.encerrado then return; end if;

  case jogo.fase
    when 'dezesseis' then pts_exato := 4;  pts_vencedor := 2; pts_invertido := -2;
    when 'oitavas'   then pts_exato := 5;  pts_vencedor := 2; pts_invertido := -2;
    when 'quartas'   then pts_exato := 8;  pts_vencedor := 3; pts_invertido := -3;
    when 'semis'     then pts_exato := 12; pts_vencedor := 5; pts_invertido := -4;
    when 'terceiro'  then pts_exato := 12; pts_vencedor := 5; pts_invertido := -4;
    when 'final'     then pts_exato := 20; pts_vencedor := 8; pts_invertido := -5;
    else                  pts_exato := 3;  pts_vencedor := 1; pts_invertido := -1;
  end case;

  resultado_jogo := case
    when jogo.gols_casa > jogo.gols_fora then 'casa'
    when jogo.gols_fora > jogo.gols_casa then 'fora'
    else 'empate' end;

  -- Calcula pontos de cada palpite
  for palpite in select * from public.palpites where jogo_id = jogo_id_param loop
    resultado_palpite := case
      when palpite.gols_casa > palpite.gols_fora then 'casa'
      when palpite.gols_fora > palpite.gols_casa then 'fora'
      else 'empate' end;

    if palpite.gols_casa = jogo.gols_casa and palpite.gols_fora = jogo.gols_fora then
      pts := pts_exato;
    elsif palpite.gols_casa = jogo.gols_fora and palpite.gols_fora = jogo.gols_casa
          and palpite.gols_casa != palpite.gols_fora then
      pts := pts_invertido;
    elsif resultado_palpite = resultado_jogo then
      pts := pts_vencedor;
    else
      pts := 0;
    end if;

    update public.palpites set pontos = pts, updated_at = now() where id = palpite.id;
  end loop;

  -- Recalcula ranking completo do zero para todos os usuários afetados
  perform public.recalcular_ranking_completo();
end;
$$;

-- 3. Recalcula ranking completo a partir de todos os palpites pontuados
create or replace function public.recalcular_ranking_completo()
returns void language plpgsql security definer as $$
begin
  update public.ranking r set
    total_pontos = (
      select coalesce(sum(p.pontos), 0)
      from public.palpites p
      join public.jogos j on p.jogo_id = j.id
      where p.user_id = r.user_id and j.encerrado
    ),
    acertos_exatos = (
      select count(*)
      from public.palpites p
      join public.jogos j on p.jogo_id = j.id
      where p.user_id = r.user_id and j.encerrado
      and p.gols_casa = j.gols_casa and p.gols_fora = j.gols_fora
    ),
    acertos_resultado = (
      select count(*)
      from public.palpites p
      join public.jogos j on p.jogo_id = j.id
      where p.user_id = r.user_id and j.encerrado
      and p.pontos > 0
      and not (p.gols_casa = j.gols_casa and p.gols_fora = j.gols_fora)
    ),
    jogos_palpitados = (
      select count(*)
      from public.palpites p
      where p.user_id = r.user_id
    ),
    updated_at = now();
end;
$$;

-- 4. Recalcula tudo agora para corrigir dados históricos
select public.recalcular_ranking_completo();

-- Confere resultado
select
  p.nome,
  r.total_pontos,
  r.acertos_exatos,
  r.acertos_resultado,
  r.jogos_palpitados
from public.ranking r
join public.perfis p on r.user_id = p.id
order by r.total_pontos desc;
