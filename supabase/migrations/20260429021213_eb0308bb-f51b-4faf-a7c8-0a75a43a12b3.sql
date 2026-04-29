CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pendente',
  amount_cents INTEGER,
  payment_method TEXT NOT NULL DEFAULT 'pix',
  paid_at TIMESTAMP WITH TIME ZONE,
  shipping_method TEXT,
  item_title TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_transaction_hash ON public.orders (transaction_hash);
CREATE INDEX idx_orders_status ON public.orders (status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view order payment status"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;