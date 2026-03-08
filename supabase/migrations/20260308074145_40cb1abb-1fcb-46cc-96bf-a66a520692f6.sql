-- Fix Megafon commission amounts to 50 RUB
UPDATE transactions SET amount = -50.00 WHERE id IN (
  '0bb8e0c5-2a56-45f4-bf71-2cd89223d121',
  '10ae34d5-3735-41f4-96b4-d4214ac9a45a',
  '3b0b96bc-6fde-43c6-9354-c359426b449c',
  '4c89a848-b73a-435e-9752-87e1b1774545'
);

-- Convert "Перевод через СБП от Егор Николаевич (Т-Банк)" incoming to outgoing self-transfers
UPDATE transactions SET 
  name = 'Перевод себе Егор Николаевич К** в Т-Банк через СБП',
  is_income = false,
  amount = -50000.00
WHERE id = '4244a9cf-7b6e-4e8f-acc5-0ea0ea929c4a';
