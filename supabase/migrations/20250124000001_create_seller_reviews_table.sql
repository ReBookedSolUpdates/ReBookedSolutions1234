-- ============================================
-- SELLER REVIEWS SYSTEM MIGRATION
-- ============================================

-- ============================================
-- 1. SELLER REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.seller_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_reviews_seller_id ON public.seller_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_reviewer_id ON public.seller_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_created_at ON public.seller_reviews(created_at DESC);

-- Add comment to table
COMMENT ON TABLE public.seller_reviews IS 'Seller reviews left by verified buyers with optional anonymity';

-- ============================================
-- 2. ROW LEVEL SECURITY SETUP
-- ============================================
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

-- Policy 1: Only logged-in users can select reviews
CREATE POLICY "Logged-in users can view seller reviews"
    ON public.seller_reviews
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Policy 2: Only logged-in users who have purchased from seller can insert reviews
CREATE POLICY "Verified buyers can create reviews"
    ON public.seller_reviews
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = reviewer_id
        AND has_completed_order_from_seller(auth.uid(), seller_id)
    );

-- Policy 3: Only the reviewer can update their own review
CREATE POLICY "Users can update their own reviews"
    ON public.seller_reviews
    FOR UPDATE
    USING (auth.uid() = reviewer_id)
    WITH CHECK (auth.uid() = reviewer_id);

-- Policy 4: Only the reviewer can delete their own review
CREATE POLICY "Users can delete their own reviews"
    ON public.seller_reviews
    FOR DELETE
    USING (auth.uid() = reviewer_id);

-- Policy 5: Service role can manage all reviews
CREATE POLICY "Service role can manage all reviews"
    ON public.seller_reviews
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to check if user has completed order from seller
CREATE OR REPLACE FUNCTION has_completed_order_from_seller(p_buyer_id UUID, p_seller_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the buyer has at least one completed order from the seller
    -- An order is considered completed when items contain the seller_id
    RETURN EXISTS (
        SELECT 1 
        FROM public.orders o
        WHERE o.seller_id = p_seller_id
        AND (o.status = 'paid' OR o.status = 'completed')
        AND o.buyer_email = (
            SELECT email FROM public.profiles WHERE id = p_buyer_id LIMIT 1
        )
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get seller average rating
CREATE OR REPLACE FUNCTION get_seller_average_rating(p_seller_id UUID)
RETURNS TABLE (
    average_rating NUMERIC,
    review_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(sr.rating)::NUMERIC, 2) as average_rating,
        COUNT(sr.id)::INTEGER as review_count
    FROM public.seller_reviews sr
    WHERE sr.seller_id = p_seller_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get masked review data (anonymity support)
CREATE OR REPLACE FUNCTION get_review_with_masked_reviewer(p_review_id UUID)
RETURNS TABLE (
    id UUID,
    seller_id UUID,
    reviewer_id UUID,
    reviewer_name TEXT,
    reviewer_avatar TEXT,
    rating INTEGER,
    comment TEXT,
    is_anonymous BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        sr.seller_id,
        sr.reviewer_id,
        CASE WHEN sr.is_anonymous THEN NULL ELSE p.name END as reviewer_name,
        CASE WHEN sr.is_anonymous THEN NULL ELSE p.avatar_url END as reviewer_avatar,
        sr.rating,
        sr.comment,
        sr.is_anonymous,
        sr.created_at,
        sr.updated_at
    FROM public.seller_reviews sr
    LEFT JOIN public.profiles p ON p.id = sr.reviewer_id
    WHERE sr.id = p_review_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 4. UPDATE TRIGGER
-- ============================================

-- Trigger function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_seller_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS seller_reviews_updated_at ON public.seller_reviews;
CREATE TRIGGER seller_reviews_updated_at
    BEFORE UPDATE ON public.seller_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_reviews_updated_at();

-- ============================================
-- 5. COMMENTS
-- ============================================
COMMENT ON COLUMN public.seller_reviews.seller_id IS 'UUID of the seller being reviewed (references profiles.id)';
COMMENT ON COLUMN public.seller_reviews.reviewer_id IS 'UUID of the user leaving the review (references profiles.id)';
COMMENT ON COLUMN public.seller_reviews.rating IS '5-star rating from 1-5';
COMMENT ON COLUMN public.seller_reviews.comment IS 'Optional text review comment';
COMMENT ON COLUMN public.seller_reviews.is_anonymous IS 'If true, reviewer name/details are hidden';
COMMENT ON COLUMN public.seller_reviews.created_at IS 'When the review was created';
COMMENT ON COLUMN public.seller_reviews.updated_at IS 'When the review was last updated';

COMMENT ON FUNCTION has_completed_order_from_seller IS 'Checks if a buyer has a completed order from a specific seller';
COMMENT ON FUNCTION get_seller_average_rating IS 'Returns the average rating and review count for a seller';
COMMENT ON FUNCTION get_review_with_masked_reviewer IS 'Returns review data with anonymized reviewer info if is_anonymous=true';
