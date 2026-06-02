-- ================================================
-- ATUALIZA função de pontuação com novas regras:
--   +3 pts → placar exato
--   +1 pt  → acertou vencedor ou empate
--    0 pts → errou o resultado
--   -1 pt  → placar invertido exato (ex: 2×0 palpitado, saiu 0×2)
-- ================================================

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
      -- Placar exato
      pts := 3;
    elsif palpite.gols_casa = jogo.gols_fora and palpite.gols_fora = jogo.gols_casa
          and palpite.gols_casa != palpite.gols_fora then
      -- Placar invertido exato (ex: palpitou 2×0, saiu 0×2)
      pts := -1;
    elsif resultado_palpite = resultado_jogo then
      -- Acertou o vencedor ou empate
      pts := 1;
    else
      -- Errou tudo
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
      case when pts = 1 then 1 else 0 end,
      1
    )
    on conflict (user_id) do update set
      total_pontos       = ranking.total_pontos + excluded.total_pontos,
      acertos_exatos     = ranking.acertos_exatos + excluded.acertos_exatos,
      acertos_resultado  = ranking.acertos_resultado + excluded.acertos_resultado,
      jogos_palpitados   = ranking.jogos_palpitados + excluded.jogos_palpitados,
      updated_at         = now();
  end loop;
end;
$$;
