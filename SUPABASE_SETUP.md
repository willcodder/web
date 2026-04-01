# Configuración de Supabase

## Paso 1: Ejecutar el SQL en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Haz clic en **SQL Editor** en el menú izquierdo
3. Haz clic en **New Query** (o "+")
4. Copia TODO el contenido del archivo `supabase-schema.sql`
5. Pégalo en el editor
6. Haz clic en **Run** (botón azul)

Esto creará:
- Tablas: companies, clients, products, invoices, invoice_lines, quotes, quote_lines, expenses
- Row Level Security (RLS) policies para que cada usuario solo vea sus datos
- Índices para optimización de queries

## Paso 2: Habilitar Email/Password Auth en Supabase

1. Ve a **Authentication > Providers** en tu proyecto
2. Asegúrate que **Email** está habilitado (debe estarlo por defecto)
3. Ve a **Email Templates** si necesitas personalizar los emails de recuperación

## Paso 3: Variables de Entorno (Opcional)

Si quieres cambiar las credenciales después, edita `src/utils/supabase.js`:
- `SUPABASE_URL`: Tu Project URL
- `SUPABASE_ANON_KEY`: Tu anon public key

**IMPORTANTE**: Estas credenciales son públicas y seguras (solo lectura de datos públicos).

## Paso 4: Migración de Datos Existentes

Cuando el usuario inicie sesión por primera vez, los datos de `localStorage` se pueden migrar a Supabase:

1. El usuario inicia sesión con Supabase Auth
2. La app detecta que hay datos en localStorage
3. Los datos se sincronizan automáticamente a Supabase

(Esto se implementará en el próximo paso)

## Paso 5: Actualizar Otros Componentes

- [ ] Register.jsx - usar auth-supabase.js
- [ ] ForgotPassword.jsx - usar auth-supabase.js
- [ ] ResetPassword.jsx - usar auth-supabase.js
- [ ] App.jsx - usar getCurrentUser de auth-supabase.js
- [ ] AppContext.jsx - modificar para cargar datos de Supabase

## URLs y Credenciales

- **Project ID**: `qhtfomwfduldtlgthujz`
- **Project URL**: `https://qhtfomwfduldtlgthujz.supabase.co`
- **Anon Key**: Proporcionada en las credenciales

## Próximos Pasos

1. ✅ Crear cliente Supabase (`src/utils/supabase.js`)
2. ✅ Crear schema SQL
3. ✅ Crear funciones de autenticación (`src/utils/auth-supabase.js`)
4. ✅ Crear funciones de sincronización (`src/utils/supabase-sync.js`)
5. ✅ Actualizar Login.jsx
6. ⏳ Actualizar Register.jsx
7. ⏳ Actualizar ForgotPassword.jsx
8. ⏳ Actualizar ResetPassword.jsx
9. ⏳ Actualizar App.jsx
10. ⏳ Reemplazar AppContext para usar Supabase
11. ⏳ Implementar migración automática de datos
12. ⏳ Implementar sincronización en tiempo real

## Troubleshooting

**Error: "Failed to fetch"**
- Verifica que las credenciales de Supabase son correctas
- Comprueba que tu proyecto está activo en Supabase

**Error: "RLS policy violation"**
- Asegúrate que el usuario está autenticado
- Verifica que las policies RLS están correctamente configuradas

**Error: "table does not exist"**
- Ejecuta nuevamente el SQL en Supabase SQL Editor
- Verifica que no hay errores en el script SQL
