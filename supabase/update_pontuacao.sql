-- ================================================
-- PONTUAÇÃO PROGRESSIVA POR FASE
-- Grupos:   exato=+3,  vencedor=+1, invertido=-1
-- Oitavas:  exato=+5,  vencedor=+2, invertido=-2
-- Quartas:  exato=+8,  vencedor=+3, invertido=-3
-- Semis:    exato=+12, vencedor=+5, invertido=-4
-- 3º Lugar: exato=+12, vencedor=+5, invertido=-4
-- Final:    exato=+20, vencedor=+8, invertido=-5
-- ================================================

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

  if jogo is null or not jogo.encerrado then
    return;
  end if;

  -- Define pontuação conforme a fase
  case jogo.fase
    when 'oitavas'  then pts_exato := 5;  pts_vencedor := 2; pts_invertido := -2;
    when 'quartas'  then pts_exato := 8;  pts_vencedor := 3; pts_invertido := -3;
    when 'semis'    then pts_exato := 12; pts_vencedor := 5; pts_invertido := -4;
    when 'terceiro' then pts_exato := 12; pts_vencedor := 5; pts_invertido := -4;
    when 'final'    then pts_exato := 20; pts_vencedor := 8; pts_invertido := -5;
    else                 pts_exato := 3;  pts_vencedor := 1; pts_invertido := -1; -- grupos
  end case;

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
      pts := pts_exato;
    elsif palpite.gols_casa = jogo.gols_fora and palpite.gols_fora = jogo.gols_casa
          and palpite.gols_casa != palpite.gols_fora then
      pts := pts_invertido;
    elsif resultado_palpite = resultado_jogo then
      pts := pts_vencedor;
    else
      pts := 0;
    end if;

    update public.palpites
    set pontos = pts, updated_at = now()
    where id = palpite.id;

    insert into public.ranking (user_id, total_pontos, acertos_exatos, acertos_resultado, jogos_palpitados)
    values (
      palpite.user_id,
      pts,
      case when pts = pts_exato then 1 else 0 end,
      case when pts = pts_vencedor then 1 else 0 end,
      1
    )
    on conflict (user_id) do update set
      total_pontos      = ranking.total_pontos + excluded.total_pontos,
      acertos_exatos    = ranking.acertos_exatos + excluded.acertos_exatos,
      acertos_resultado = ranking.acertos_resultado + excluded.acertos_resultado,
      jogos_palpitados  = ranking.jogos_palpitados + excluded.jogos_palpitados,
      updated_at        = now();
  end loop;
end;
$$;
