CREATE OR REPLACE FUNCTION public.get_seller_average_rating(p_seller_id uuid)
RETURNS TABLE(average_rating numeric, review_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*)::bigint as review_count
  FROM public.seller_reviews
  WHERE seller_id = p_seller_id;
$$;