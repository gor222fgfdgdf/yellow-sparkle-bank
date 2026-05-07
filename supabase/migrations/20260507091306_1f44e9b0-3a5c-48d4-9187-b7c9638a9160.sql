UPDATE transactions 
SET created_at = (date::timestamp + interval '12 hours') AT TIME ZONE 'Asia/Ho_Chi_Minh'
WHERE created_at >= '2026-05-07 19:00:00+00' 
  AND date >= '2026-04-21';