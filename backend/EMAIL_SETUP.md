Email setup
===============

To send real verification emails you must configure a mail driver and credentials in `backend/.env`.

Minimum settings to add or update in `.env`:

- `MAIL_MAILER=smtp`
- `MAIL_HOST=smtp.example.com` (or `sandbox.smtp.mailtrap.io` for Mailtrap)
- `MAIL_PORT=587` (or `2525` for Mailtrap)
- `MAIL_USERNAME=your_smtp_username`
- `MAIL_PASSWORD=your_smtp_password`
- `MAIL_ENCRYPTION=tls`
- `MAIL_FROM_ADDRESS=noreply@yourdomain.com`
- `MAIL_FROM_NAME="Your App Name"`

Examples:

For Mailtrap (testing):

```
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=xxxx
MAIL_PASSWORD=xxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@casaway.ma
MAIL_FROM_NAME="CasaWay"
```

For SendGrid / production: follow provider docs and set `MAIL_USERNAME`/`MAIL_PASSWORD`.

After updating `.env`, clear config cache and restart services:

```bash
php artisan config:clear
php artisan cache:clear
php artisan queue:restart
```

If notifications are queued, run the queue worker:

```bash
php artisan queue:work --tries=3
```

Testing a verification email locally:

1. Create a test user via the app or tinker and call `generateVerificationCode()`.
2. Trigger the notification by registering or using tinker:

```php
$user = App\Models\Client::find(1);
$code = $user->generateVerificationCode();
$user->notify(new App\Notifications\VerifyEmailNotification($code));
```

If you still see logs instead of delivery, check `MAIL_MAILER` in `backend/.env` and confirm it is not set to `log`.
