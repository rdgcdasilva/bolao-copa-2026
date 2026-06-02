-- ================================================
-- JOGOS DA FASE DE GRUPOS — Copa do Mundo 2026
-- Fonte: Poder360 / FIFA oficial
-- Horários de Brasília
-- ================================================

-- Limpa jogos anteriores (se houver)
delete from public.palpites;
delete from public.jogos;

insert into public.jogos (fase, grupo, time_casa, time_fora, bandeira_casa, bandeira_fora, data_hora, ordem) values

-- GRUPO A
('grupos', 'A', 'México',          'África do Sul',   'MX', 'ZA', '2026-06-11 21:00:00-03', 1),
('grupos', 'A', 'Coreia do Sul',   'Rep. Tcheca',     'KR', 'CZ', '2026-06-11 18:00:00-03', 2),
('grupos', 'A', 'Rep. Tcheca',     'África do Sul',   'CZ', 'ZA', '2026-06-18 18:00:00-03', 3),
('grupos', 'A', 'México',          'Coreia do Sul',   'MX', 'KR', '2026-06-18 21:00:00-03', 4),
('grupos', 'A', 'Rep. Tcheca',     'México',          'CZ', 'MX', '2026-06-24 18:00:00-03', 5),
('grupos', 'A', 'África do Sul',   'Coreia do Sul',   'ZA', 'KR', '2026-06-24 18:00:00-03', 6),

-- GRUPO B
('grupos', 'B', 'Canadá',          'Bósnia',          'CA', 'BA', '2026-06-12 18:00:00-03', 7),
('grupos', 'B', 'Qatar',           'Suíça',           'QA', 'CH', '2026-06-13 18:00:00-03', 8),
('grupos', 'B', 'Suíça',           'Bósnia',          'CH', 'BA', '2026-06-18 18:00:00-03', 9),
('grupos', 'B', 'Canadá',          'Qatar',           'CA', 'QA', '2026-06-18 21:00:00-03', 10),
('grupos', 'B', 'Suíça',           'Canadá',          'CH', 'CA', '2026-06-24 18:00:00-03', 11),
('grupos', 'B', 'Bósnia',          'Qatar',           'BA', 'QA', '2026-06-24 18:00:00-03', 12),

-- GRUPO C
('grupos', 'C', 'Brasil',          'Marrocos',        'BR', 'MA', '2026-06-13 15:00:00-03', 13),
('grupos', 'C', 'Haiti',           'Escócia',         'HT', 'GB-SCT', '2026-06-13 21:00:00-03', 14),
('grupos', 'C', 'Escócia',         'Marrocos',        'GB-SCT', 'MA', '2026-06-19 18:00:00-03', 15),
('grupos', 'C', 'Brasil',          'Haiti',           'BR', 'HT', '2026-06-19 21:00:00-03', 16),
('grupos', 'C', 'Escócia',         'Brasil',          'GB-SCT', 'BR', '2026-06-24 18:00:00-03', 17),
('grupos', 'C', 'Marrocos',        'Haiti',           'MA', 'HT', '2026-06-24 18:00:00-03', 18),

-- GRUPO D
('grupos', 'D', 'EUA',             'Paraguai',        'US', 'PY', '2026-06-12 21:00:00-03', 19),
('grupos', 'D', 'Austrália',       'Turquia',         'AU', 'TR', '2026-06-14 18:00:00-03', 20),
('grupos', 'D', 'Turquia',         'Paraguai',        'TR', 'PY', '2026-06-19 18:00:00-03', 21),
('grupos', 'D', 'EUA',             'Austrália',       'US', 'AU', '2026-06-19 21:00:00-03', 22),
('grupos', 'D', 'Turquia',         'EUA',             'TR', 'US', '2026-06-25 18:00:00-03', 23),
('grupos', 'D', 'Paraguai',        'Austrália',       'PY', 'AU', '2026-06-25 18:00:00-03', 24),

-- GRUPO E
('grupos', 'E', 'Alemanha',        'Curaçao',         'DE', 'CW', '2026-06-14 18:00:00-03', 25),
('grupos', 'E', 'Costa do Marfim', 'Equador',         'CI', 'EC', '2026-06-14 21:00:00-03', 26),
('grupos', 'E', 'Alemanha',        'Costa do Marfim', 'DE', 'CI', '2026-06-20 18:00:00-03', 27),
('grupos', 'E', 'Equador',         'Curaçao',         'EC', 'CW', '2026-06-20 21:00:00-03', 28),
('grupos', 'E', 'Equador',         'Alemanha',        'EC', 'DE', '2026-06-25 18:00:00-03', 29),
('grupos', 'E', 'Curaçao',         'Costa do Marfim', 'CW', 'CI', '2026-06-25 18:00:00-03', 30),

-- GRUPO F
('grupos', 'F', 'Holanda',         'Japão',           'NL', 'JP', '2026-06-14 21:00:00-03', 31),
('grupos', 'F', 'Suécia',          'Tunísia',         'SE', 'TN', '2026-06-14 18:00:00-03', 32),
('grupos', 'F', 'Tunísia',         'Japão',           'TN', 'JP', '2026-06-21 18:00:00-03', 33),
('grupos', 'F', 'Holanda',         'Suécia',          'NL', 'SE', '2026-06-20 21:00:00-03', 34),
('grupos', 'F', 'Tunísia',         'Holanda',         'TN', 'NL', '2026-06-25 18:00:00-03', 35),
('grupos', 'F', 'Japão',           'Suécia',          'JP', 'SE', '2026-06-25 18:00:00-03', 36),

-- GRUPO G
('grupos', 'G', 'Bélgica',         'Egito',           'BE', 'EG', '2026-06-15 18:00:00-03', 37),
('grupos', 'G', 'Irã',             'Nova Zelândia',   'IR', 'NZ', '2026-06-15 21:00:00-03', 38),
('grupos', 'G', 'Bélgica',         'Irã',             'BE', 'IR', '2026-06-21 18:00:00-03', 39),
('grupos', 'G', 'Nova Zelândia',   'Egito',           'NZ', 'EG', '2026-06-21 21:00:00-03', 40),
('grupos', 'G', 'Nova Zelândia',   'Bélgica',         'NZ', 'BE', '2026-06-27 18:00:00-03', 41),
('grupos', 'G', 'Egito',           'Irã',             'EG', 'IR', '2026-06-27 18:00:00-03', 42),

-- GRUPO H
('grupos', 'H', 'Espanha',         'Cabo Verde',      'ES', 'CV', '2026-06-15 21:00:00-03', 43),
('grupos', 'H', 'Arábia Saudita',  'Uruguai',         'SA', 'UY', '2026-06-15 18:00:00-03', 44),
('grupos', 'H', 'Espanha',         'Arábia Saudita',  'ES', 'SA', '2026-06-21 21:00:00-03', 45),
('grupos', 'H', 'Uruguai',         'Cabo Verde',      'UY', 'CV', '2026-06-21 18:00:00-03', 46),
('grupos', 'H', 'Uruguai',         'Espanha',         'UY', 'ES', '2026-06-26 18:00:00-03', 47),
('grupos', 'H', 'Cabo Verde',      'Arábia Saudita',  'CV', 'SA', '2026-06-26 18:00:00-03', 48),

-- GRUPO I
('grupos', 'I', 'França',          'Senegal',         'FR', 'SN', '2026-06-16 18:00:00-03', 49),
('grupos', 'I', 'Iraque',          'Noruega',         'IQ', 'NO', '2026-06-16 21:00:00-03', 50),
('grupos', 'I', 'França',          'Iraque',          'FR', 'IQ', '2026-06-22 18:00:00-03', 51),
('grupos', 'I', 'Noruega',         'Senegal',         'NO', 'SN', '2026-06-22 21:00:00-03', 52),
('grupos', 'I', 'Noruega',         'França',          'NO', 'FR', '2026-06-26 18:00:00-03', 53),
('grupos', 'I', 'Senegal',         'Iraque',          'SN', 'IQ', '2026-06-26 18:00:00-03', 54),

-- GRUPO J
('grupos', 'J', 'Argentina',       'Argélia',         'AR', 'DZ', '2026-06-16 21:00:00-03', 55),
('grupos', 'J', 'Áustria',         'Jordânia',        'AT', 'JO', '2026-06-17 18:00:00-03', 56),
('grupos', 'J', 'Argentina',       'Áustria',         'AR', 'AT', '2026-06-22 21:00:00-03', 57),
('grupos', 'J', 'Jordânia',        'Argélia',         'JO', 'DZ', '2026-06-23 18:00:00-03', 58),
('grupos', 'J', 'Jordânia',        'Argentina',       'JO', 'AR', '2026-06-27 18:00:00-03', 59),
('grupos', 'J', 'Argélia',         'Áustria',         'DZ', 'AT', '2026-06-27 18:00:00-03', 60),

-- GRUPO K
('grupos', 'K', 'Portugal',        'Rep. Dem. Congo', 'PT', 'CD', '2026-06-17 21:00:00-03', 61),
('grupos', 'K', 'Uzbequistão',     'Colômbia',        'UZ', 'CO', '2026-06-17 18:00:00-03', 62),
('grupos', 'K', 'Portugal',        'Uzbequistão',     'PT', 'UZ', '2026-06-23 18:00:00-03', 63),
('grupos', 'K', 'Colômbia',        'Rep. Dem. Congo', 'CO', 'CD', '2026-06-23 21:00:00-03', 64),
('grupos', 'K', 'Colômbia',        'Portugal',        'CO', 'PT', '2026-06-27 18:00:00-03', 65),
('grupos', 'K', 'Rep. Dem. Congo', 'Uzbequistão',     'CD', 'UZ', '2026-06-27 18:00:00-03', 66),

-- GRUPO L
('grupos', 'L', 'Inglaterra',      'Croácia',         'GB-ENG', 'HR', '2026-06-17 21:00:00-03', 67),
('grupos', 'L', 'Gana',            'Panamá',          'GH', 'PA', '2026-06-17 18:00:00-03', 68),
('grupos', 'L', 'Inglaterra',      'Gana',            'GB-ENG', 'GH', '2026-06-23 21:00:00-03', 69),
('grupos', 'L', 'Panamá',          'Croácia',         'PA', 'HR', '2026-06-23 18:00:00-03', 70),
('grupos', 'L', 'Panamá',          'Inglaterra',      'PA', 'GB-ENG', '2026-06-27 18:00:00-03', 71),
('grupos', 'L', 'Croácia',         'Gana',            'HR', 'GH', '2026-06-27 18:00:00-03', 72);
