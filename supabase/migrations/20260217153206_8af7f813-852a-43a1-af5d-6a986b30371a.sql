
ALTER TABLE public.accounts ADD COLUMN account_number text;

-- Revert card_number back and set account_number
UPDATE public.accounts SET card_number = '4276', account_number = '40817810514230007456' WHERE card_number = '40817810514230007456';
