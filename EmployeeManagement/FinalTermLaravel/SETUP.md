# FinalTermLaravel (PeopleHub) – setup

Laravel 12 + React + Inertia.js + Fortify + Spatie Permission + Tailwind CSS (via Vite).
This zip is an **overlay**: it holds only the files you add or replace on a fresh Laravel project.

## Requirements
PHP 8.2+ (`php -v`), Composer, Node 20+ (`node -v`), MySQL (XAMPP is fine).

## 1. Create the Laravel project
```
composer create-project laravel/laravel:^12.0 FinalTermLaravel
cd FinalTermLaravel
git init
git add . && git commit -m "Fresh Laravel install"
```

## 2. Install the packages
```
composer require inertiajs/inertia-laravel:^2.0 laravel/fortify spatie/laravel-permission
npm install react react-dom @inertiajs/react@^2 @vitejs/plugin-react
npm install -D tailwindcss @tailwindcss/vite
php artisan fortify:install
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
git add . && git commit -m "Install Inertia, React, Fortify, Spatie"
```
(Skip the Tailwind line if `npm ls tailwindcss` shows it is already installed.)

## 3. Copy the overlay
Unzip this overlay into the project folder and choose **Replace** for existing files
(bootstrap/app.php, routes/web.php, config/fortify.php, app/Models/User.php,
database/seeders/DatabaseSeeder.php, vite.config.js, resources/css/app.css, ...).

Check `bootstrap/providers.php` lists `App\Providers\FortifyServiceProvider::class`
(fortify:install normally adds it).

## 4. Database (phpMyAdmin)
1. Start MySQL in XAMPP, open http://localhost/phpmyadmin
2. New -> database name `finaltermlaravel`, collation `utf8mb4_unicode_ci` -> Create
   (no tables needed; migrations create them)
3. In `.env` set:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finaltermlaravel
DB_USERNAME=root
DB_PASSWORD=
```

## 5. Migrate, seed, run
```
php artisan migrate:fresh --seed
npm run dev          # terminal 1
php artisan serve    # terminal 2 -> http://127.0.0.1:8000
```

## Test accounts (password: `password`)
| Role     | Email                    | Can do |
|----------|--------------------------|--------|
| Admin    | admin@peoplehub.test     | everything: employees, departments, attendance, approve leaves |
| Manager  | manager@peoplehub.test   | view employees/attendance, approve or reject leaves |
| Employee | employee@peoplehub.test  | time in/out, request leave, see own records only |

Self-registration (/register) creates an Employee account. Password reset emails are
written to `storage/logs/laravel.log` while `MAIL_MAILER=log`.

## Where each rubric item lives
- Architecture: migrations in database/migrations, models with `$fillable` + relationships, resource controllers, modular routes in routes/*.php
- Frontend: resources/js (Pages, Components, Layouts); controllers return `Inertia::render()`
- Security: Fortify auth, Spatie roles/permissions (RolesAndPermissionsSeeder), route middleware (`permission:`), `$request->validate()` everywhere, CSRF via Inertia's XSRF cookie, UI hidden by role with `useAuth().can()`
- AJAX: time in/out, leave approve/reject, employee search and filters (Inertia XHR, no full reload)

## Suggested commit history
1. Fresh Laravel install / 2. Install packages / 3. Migrations and models / 4. Seeders and RBAC
5. Fortify auth + React auth pages / 6. Employees and departments CRUD / 7. Attendance / 8. Leave requests / 9. Dashboard and polish
