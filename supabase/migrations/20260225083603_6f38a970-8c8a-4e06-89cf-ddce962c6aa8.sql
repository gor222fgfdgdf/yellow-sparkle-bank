CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    main_account_id UUID;
    investment_account_id UUID;
    credit_account_id UUID;
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Пользователь'));

    -- Create user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');

    -- Create user settings
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);

    -- Create default accounts (no savings account)
    INSERT INTO public.accounts (user_id, type, name, balance, card_number, color)
    VALUES (NEW.id, 'card', 'Tinkoff Black', 3670797.00, '4276', 'bg-foreground text-background')
    RETURNING id INTO main_account_id;

    INSERT INTO public.accounts (user_id, type, name, balance, color)
    VALUES (NEW.id, 'investment', 'Инвестиции', 1250000.00, 'bg-primary text-primary-foreground')
    RETURNING id INTO investment_account_id;

    INSERT INTO public.accounts (user_id, type, name, balance, card_number, credit_limit, min_payment, payment_due_date, color)
    VALUES (NEW.id, 'credit', 'Кредитная карта', -45000.00, '5213', 300000.00, 4500.00, CURRENT_DATE + INTERVAL '15 days', 'bg-destructive text-destructive-foreground')
    RETURNING id INTO credit_account_id;

    -- Create initial transactions for main account
    INSERT INTO public.transactions (user_id, account_id, name, category, amount, is_income, icon, date)
    VALUES
        (NEW.id, main_account_id, 'Зарплата', 'Доход', 500000, true, 'Briefcase', CURRENT_DATE - INTERVAL '5 days'),
        (NEW.id, main_account_id, 'Пятёрочка', 'Продукты', -3450, false, 'ShoppingCart', CURRENT_DATE - INTERVAL '1 day'),
        (NEW.id, main_account_id, 'Яндекс.Такси', 'Транспорт', -890, false, 'Car', CURRENT_DATE - INTERVAL '2 days'),
        (NEW.id, main_account_id, 'Netflix', 'Развлечения', -1190, false, 'Tv', CURRENT_DATE - INTERVAL '3 days'),
        (NEW.id, main_account_id, 'Кофемания', 'Рестораны', -650, false, 'Coffee', CURRENT_DATE - INTERVAL '4 days'),
        (NEW.id, main_account_id, 'Перевод от Алексея', 'Переводы', 15000, true, 'ArrowDownLeft', CURRENT_DATE - INTERVAL '6 days'),
        (NEW.id, main_account_id, 'Ozon', 'Покупки', -12500, false, 'ShoppingBag', CURRENT_DATE - INTERVAL '7 days'),
        (NEW.id, main_account_id, 'Аптека 36.6', 'Здоровье', -2340, false, 'Heart', CURRENT_DATE - INTERVAL '8 days'),
        (NEW.id, main_account_id, 'МТС', 'Связь', -750, false, 'Phone', CURRENT_DATE - INTERVAL '9 days'),
        (NEW.id, main_account_id, 'Перекрёсток', 'Продукты', -5670, false, 'ShoppingCart', CURRENT_DATE - INTERVAL '10 days');

    -- Create initial cashback balance
    INSERT INTO public.cashback_balance (user_id, balance, pending_balance)
    VALUES (NEW.id, 2450.00, 380.00);

    -- Create default cashback categories
    INSERT INTO public.cashback_categories (user_id, category, percentage, is_selected, earned_amount)
    VALUES
        (NEW.id, 'Рестораны', 5, true, 1250),
        (NEW.id, 'Супермаркеты', 3, true, 890),
        (NEW.id, 'Транспорт', 5, true, 560),
        (NEW.id, 'Аптеки', 3, false, 0),
        (NEW.id, 'АЗС', 5, false, 0),
        (NEW.id, 'Одежда', 3, false, 0);

    -- Create initial notifications
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES
        (NEW.id, 'promo', 'Добро пожаловать!', 'Рады видеть вас в приложении Россельхозбанк!'),
        (NEW.id, 'info', 'Кэшбэк', 'Выберите категории повышенного кэшбэка на этот месяц');

    RETURN NEW;
END;
$$;