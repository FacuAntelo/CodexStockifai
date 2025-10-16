# Guía rápida para levantar el backend

## 1. Prerrequisitos
- Python 3.10+ y pip.
- MySQL 8 (local o remoto) con un schema vacío llamado `stockifai` y un usuario con permisos sobre ese schema (en los ejemplos se usa `root`/`root`).
- (Opcional) Virtualenv para aislar dependencias.

## 2. Crear el entorno y dependencias
```bash
python -m venv .venv
source .venv/bin/activate  # En Windows usar .venv\\Scripts\\activate
pip install -r requirements.txt
```

## 3. Configurar las variables de entorno
1. Copiá el archivo `.env` incluido en el repo (o `.env.example` si existiera) y completá los valores locales.
2. Asegurate de establecer `DB_TARGET=local` para que Django use la configuración que apunta a tu base de datos local.
3. Ajustá `DB_NAME_LOCAL`, `DB_USER_LOCAL`, `DB_PASSWORD_LOCAL`, `DB_HOST_LOCAL` y `DB_PORT_LOCAL` según tus credenciales. Si usás sockets o puertos distintos, también podés definir los overrides opcionales (`DB_CONNECT_TIMEOUT_LOCAL`, `DB_CHARSET_LOCAL`, etc.).

> **Nota:** Si nunca creaste el schema en MySQL, podés hacerlo ejecutando `CREATE DATABASE stockifai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;` con un cliente MySQL y asignando permisos al usuario configurado en el `.env`.

## 4. Inicializar la base vacía
Con la base local vacía **no hace falta** correr `makemigrations` (ya están versionadas en el repo). Sólo ejecutá las migraciones existentes para crear toda la estructura de tablas:
```bash
python manage.py migrate
```

El comando anterior aplica automáticamente todas las migraciones incluidas, como la que agrega los campos de geolocalización al modelo `Taller`.

## 5. Cargar datos de prueba (opcional)
Si querés usar los datos de ejemplo del localizador, guardá la semilla provista como `seed_localizador.json` y ejecutá:
```bash
python manage.py loaddata seed_localizador.json
```
Esto insertará talleres, grupos, repuestos y stock básico para probar el endpoint `/inventario/api/talleres/<taller_id>/localizador`.

## 6. Levantar el servidor de desarrollo
Finalmente iniciá el backend:
```bash
python manage.py runserver 0.0.0.0:8000
```

Con estos pasos vas a tener el backend corriendo contra una base local recién inicializada, listo para que el front realice consultas de stock.
