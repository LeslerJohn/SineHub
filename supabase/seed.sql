-- ==========================================
-- SINEHUB: Initial Seed Data
-- ==========================================

-- Seed Sample Cinemas (Zamboanga City Focus as per task notes)
INSERT INTO public.cinemas (id, name, brand, city, lat, lng, website_url) VALUES
(uuid_generate_v4(), 'SM City Mindpro', 'SM', 'Zamboanga City', 6.906665, 122.073409, 'https://www.smcinema.com/sites/SM-City-Mindpro/2111'),
(uuid_generate_v4(), 'KCC Mall de Zamboanga', 'KCC', 'Zamboanga City', 6.914272, 122.063162, 'https://www.facebook.com/KCCMallDeZamboanga'),
(uuid_generate_v4(), 'Robinsons Pagadian', 'Robinsons', 'Pagadian City', 7.827028, 123.437139, 'https://robinsonsmovieworld.com/cinema/branch?data=U2FsdGVkX19cFXxN47Z50tH%2FtrjJSvkyREqSLBh5kqliPed2FbFEYHDmWN1G1AO%2BjfVMDj1oU7rfnc68PNCHxg%3D%3D'),
(uuid_generate_v4(), 'Ayala Center Cebu', 'Ayala', 'Cebu City', 10.3181, 123.9050, 'https://www.ayalaallaccess.com/'),
(uuid_generate_v4(), 'Ayala Malls Circuit', 'Ayala', 'Makati City', 14.5739, 121.0189, 'https://www.ayalaallaccess.com/');
