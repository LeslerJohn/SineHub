-- ==========================================
-- SINEHUB: Initial Seed Data
-- ==========================================

-- Seed Sample Cinemas (Zamboanga City Focus as per task notes)
INSERT INTO public.cinemas (id, name, brand, city, lat, lng, website_url) VALUES
(uuid_generate_v4(), 'SM City Mindpro', 'SM', 'Zamboanga City', 6.906665, 122.073409, 'https://www.smcinema.com'),
(uuid_generate_v4(), 'KCC Mall de Zamboanga', 'KCC', 'Zamboanga City', 6.914272, 122.063162, 'https://www.kccmalls.com'),
(uuid_generate_v4(), 'Robinsons Place Zamboanga', 'Robinsons', 'Zamboanga City', 6.912644, 122.062013, 'https://www.robinsonsmovieworld.com');
