-- ==========================================
-- SINEHUB: Scraper Logs RLS Policies
-- ==========================================

ALTER TABLE public.scraper_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view scraper logs"
    ON public.scraper_logs
    FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Service role can insert scraper logs"
    ON public.scraper_logs
    FOR INSERT
    WITH CHECK (true);
