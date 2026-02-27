
-- Add currency fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN currency text NOT NULL DEFAULT 'RUB',
ADD COLUMN original_amount numeric,
ADD COLUMN commission numeric DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.transactions.currency IS 'Transaction currency code (RUB, THB, VND, USD, etc.)';
COMMENT ON COLUMN public.transactions.original_amount IS 'Original amount in transaction currency (null means same as amount)';
COMMENT ON COLUMN public.transactions.commission IS 'Bank commission for currency conversion';
