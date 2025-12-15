
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User roles RLS policies
CREATE POLICY "Users can view own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

-- User settings table
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    theme TEXT DEFAULT 'light',
    pin_hash TEXT,
    biometric_enabled BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
FOR UPDATE USING (auth.uid() = user_id);

-- Accounts table
CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('card', 'savings', 'investment', 'credit')),
    name TEXT NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    card_number TEXT,
    rate DECIMAL(5, 2),
    color TEXT NOT NULL DEFAULT 'bg-primary text-primary-foreground',
    credit_limit DECIMAL(15, 2),
    min_payment DECIMAL(15, 2),
    payment_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON public.accounts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts" ON public.accounts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON public.accounts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON public.accounts
FOR DELETE USING (auth.uid() = user_id);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    is_income BOOLEAN DEFAULT false,
    icon TEXT NOT NULL DEFAULT 'CreditCard',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
FOR DELETE USING (auth.uid() = user_id);

-- Budgets table
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    limit_amount DECIMAL(15, 2) NOT NULL,
    color TEXT NOT NULL DEFAULT 'bg-primary',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, category)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets" ON public.budgets
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
FOR DELETE USING (auth.uid() = user_id);

-- Savings goals table
CREATE TABLE public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    icon TEXT NOT NULL DEFAULT 'Target',
    color TEXT NOT NULL DEFAULT 'bg-primary',
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON public.savings_goals
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.savings_goals
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.savings_goals
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.savings_goals
FOR DELETE USING (auth.uid() = user_id);

-- Payment templates table
CREATE TABLE public.payment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    provider TEXT NOT NULL,
    account_number TEXT NOT NULL,
    amount DECIMAL(15, 2),
    icon TEXT NOT NULL DEFAULT 'CreditCard',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own templates" ON public.payment_templates
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON public.payment_templates
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.payment_templates
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON public.payment_templates
FOR DELETE USING (auth.uid() = user_id);

-- Auto payments table
CREATE TABLE public.auto_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    provider TEXT NOT NULL,
    account_number TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly')),
    day_of_month INTEGER,
    day_of_week INTEGER,
    next_payment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    icon TEXT NOT NULL DEFAULT 'CreditCard',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.auto_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own auto_payments" ON public.auto_payments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auto_payments" ON public.auto_payments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auto_payments" ON public.auto_payments
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own auto_payments" ON public.auto_payments
FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    next_payment_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    icon TEXT NOT NULL DEFAULT 'CreditCard',
    color TEXT NOT NULL DEFAULT 'bg-primary',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions" ON public.subscriptions
FOR DELETE USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('transaction', 'security', 'promo', 'system', 'reminder')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
FOR DELETE USING (auth.uid() = user_id);

-- Family members table
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT,
    daily_limit DECIMAL(15, 2),
    monthly_limit DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family_members" ON public.family_members
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family_members" ON public.family_members
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own family_members" ON public.family_members
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own family_members" ON public.family_members
FOR DELETE USING (auth.uid() = user_id);

-- Spending limits table
CREATE TABLE public.spending_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    limit_amount DECIMAL(15, 2) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, category)
);

ALTER TABLE public.spending_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own spending_limits" ON public.spending_limits
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spending_limits" ON public.spending_limits
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spending_limits" ON public.spending_limits
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own spending_limits" ON public.spending_limits
FOR DELETE USING (auth.uid() = user_id);

-- Cashback categories table
CREATE TABLE public.cashback_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    percentage DECIMAL(4, 2) NOT NULL,
    is_selected BOOLEAN DEFAULT false,
    earned_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, category)
);

ALTER TABLE public.cashback_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cashback_categories" ON public.cashback_categories
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cashback_categories" ON public.cashback_categories
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cashback_categories" ON public.cashback_categories
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cashback_categories" ON public.cashback_categories
FOR DELETE USING (auth.uid() = user_id);

-- Cashback balance table
CREATE TABLE public.cashback_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0,
    pending_balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cashback_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cashback_balance" ON public.cashback_balance
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cashback_balance" ON public.cashback_balance
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cashback_balance" ON public.cashback_balance
FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_payments_updated_at BEFORE UPDATE ON public.auto_payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spending_limits_updated_at BEFORE UPDATE ON public.spending_limits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cashback_categories_updated_at BEFORE UPDATE ON public.cashback_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cashback_balance_updated_at BEFORE UPDATE ON public.cashback_balance
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create initial data for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    main_account_id UUID;
    savings_account_id UUID;
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

    -- Create default accounts
    INSERT INTO public.accounts (user_id, type, name, balance, card_number, color)
    VALUES (NEW.id, 'card', 'Tinkoff Black', 3670797.00, '4276', 'bg-foreground text-background')
    RETURNING id INTO main_account_id;

    INSERT INTO public.accounts (user_id, type, name, balance, rate, color)
    VALUES (NEW.id, 'savings', 'Накопительный счёт', 850000.00, 16.0, 'bg-success text-success-foreground')
    RETURNING id INTO savings_account_id;

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
        (NEW.id, 'Развлечения', 10, false, 0),
        (NEW.id, 'АЗС', 5, false, 0),
        (NEW.id, 'Аптеки', 3, false, 0);

    -- Create initial subscriptions
    INSERT INTO public.subscriptions (user_id, name, category, amount, next_payment_date, icon, color)
    VALUES
        (NEW.id, 'Яндекс.Плюс', 'Развлечения', 299, CURRENT_DATE + INTERVAL '12 days', 'Play', 'bg-destructive'),
        (NEW.id, 'Netflix', 'Развлечения', 1190, CURRENT_DATE + INTERVAL '8 days', 'Tv', 'bg-primary'),
        (NEW.id, 'Spotify', 'Музыка', 169, CURRENT_DATE + INTERVAL '20 days', 'Music', 'bg-success');

    -- Create initial notifications
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES
        (NEW.id, 'transaction', 'Новое поступление', 'Зачислена зарплата 500 000 ₽'),
        (NEW.id, 'promo', 'Кэшбэк 10%', 'Повышенный кэшбэк на развлечения до конца месяца'),
        (NEW.id, 'system', 'Добро пожаловать!', 'Рады видеть вас в нашем приложении');

    RETURN NEW;
END;
$$;

-- Trigger to create initial data on user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Set REPLICA IDENTITY for realtime
ALTER TABLE public.accounts REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
