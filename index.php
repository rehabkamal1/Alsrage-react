<?php
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// 1. التحقق من مسار الـ Maintenance
if (file_exists($maintenance = __DIR__.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

// 2. تحميل الـ Autoloader (تأكدي أن مجلد vendor موجود في نفس المكان)
require __DIR__.'/vendor/autoload.php';

// 3. تحميل الـ Bootstrap (تأكدي أن مجلد bootstrap موجود في نفس المكان)
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
