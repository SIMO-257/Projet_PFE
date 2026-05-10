# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```
Projet_PFE
├─ backend
│  ├─ .editorconfig
│  ├─ .env.example
│  ├─ app
│  │  ├─ Http
│  │  │  └─ Controllers
│  │  │     └─ Controller.php
│  │  ├─ Models
│  │  │  └─ User.php
│  │  └─ Providers
│  │     └─ AppServiceProvider.php
│  ├─ artisan
│  ├─ bootstrap
│  │  ├─ app.php
│  │  ├─ cache
│  │  └─ providers.php
│  ├─ composer.json
│  ├─ composer.lock
│  ├─ config
│  │  ├─ app.php
│  │  ├─ auth.php
│  │  ├─ cache.php
│  │  ├─ database.php
│  │  ├─ filesystems.php
│  │  ├─ logging.php
│  │  ├─ mail.php
│  │  ├─ queue.php
│  │  ├─ services.php
│  │  └─ session.php
│  ├─ database
│  │  ├─ factories
│  │  │  └─ UserFactory.php
│  │  ├─ migrations
│  │  │  ├─ 0001_01_01_000000_create_users_table.php
│  │  │  ├─ 0001_01_01_000001_create_cache_table.php
│  │  │  └─ 0001_01_01_000002_create_jobs_table.php
│  │  └─ seeders
│  │     └─ DatabaseSeeder.php
│  ├─ package.json
│  ├─ phpunit.xml
│  ├─ public
│  │  ├─ .htaccess
│  │  ├─ favicon.ico
│  │  ├─ index.php
│  │  └─ robots.txt
│  ├─ README.md
│  ├─ resources
│  │  ├─ css
│  │  │  └─ app.css
│  │  ├─ js
│  │  │  ├─ app.js
│  │  │  └─ bootstrap.js
│  │  └─ views
│  │     └─ welcome.blade.php
│  ├─ routes
│  │  ├─ console.php
│  │  └─ web.php
│  ├─ storage
│  │  ├─ app
│  │  │  ├─ private
│  │  │  └─ public
│  │  └─ framework
│  │     ├─ cache
│  │     │  └─ data
│  │     ├─ sessions
│  │     ├─ testing
│  │     └─ views
│  ├─ tests
│  │  ├─ Feature
│  │  │  └─ ExampleTest.php
│  │  ├─ TestCase.php
│  │  └─ Unit
│  │     └─ ExampleTest.php
│  └─ vite.config.js
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.cjs
├─ postcss.config.js
├─ public
│  └─ vite.svg
├─ README.md
├─ src
│  ├─ App.jsx
│  ├─ assets
│  │  └─ react.svg
│  ├─ Components
│  │  ├─ Buttons
│  │  │  ├─ ActionButton.jsx
│  │  │  ├─ CardButton.jsx
│  │  │  ├─ ConnexionButton.jsx
│  │  │  ├─ NavButton.jsx
│  │  │  ├─ PaymentButton.jsx
│  │  │  └─ SocialButton.jsx
│  │  ├─ Cards
│  │  │  ├─ ActionButtonCard.jsx
│  │  │  ├─ BalanceCard.jsx
│  │  │  ├─ InfoCard.jsx
│  │  │  ├─ JourneyInfoCard.jsx
│  │  │  ├─ PurchaseCard.jsx
│  │  │  ├─ RechargeSummaryCard.jsx
│  │  │  ├─ SummaryCard.jsx
│  │  │  ├─ Ticket.jsx
│  │  │  ├─ TicketInfoCard.jsx
│  │  │  ├─ TransactionDetailsCard.jsx
│  │  │  ├─ TransactionItem.jsx
│  │  │  └─ ValidationCard.jsx
│  │  ├─ Form
│  │  │  └─ FormOptions.jsx
│  │  ├─ Inputs
│  │  │  ├─ CheckboxInput.jsx
│  │  │  ├─ InputField.jsx
│  │  │  └─ PasswordInput.jsx
│  │  ├─ Layout
│  │  │  ├─ BottomNavigation.jsx
│  │  │  ├─ Header.jsx
│  │  │  ├─ ModalOverlay.jsx
│  │  │  ├─ SectionHeader.jsx
│  │  │  └─ TransactionGroup.jsx
│  │  ├─ NavBar
│  │  │  ├─ NavBar.jsx
│  │  │  └─ ProgressSteps.jsx
│  │  ├─ Payment
│  │  │  ├─ PaymentMethod.jsx
│  │  │  ├─ PaymentSummary.jsx
│  │  │  └─ TicketInfo.jsx
│  │  └─ UI
│  │     ├─ CollapsibleSection.jsx
│  │     ├─ FilterTabs.jsx
│  │     ├─ NFCAnimation.jsx
│  │     ├─ Notification.jsx
│  │     ├─ NotificationButton.jsx
│  │     ├─ ProcessingIndicator.jsx
│  │     ├─ QRCodeDisplay.jsx
│  │     ├─ StatusIndicator.jsx
│  │     ├─ TicketIconAnimation.jsx
│  │     └─ TimerDisplay.jsx
│  ├─ main.jsx
│  ├─ Pages
│  │  ├─ ConfirmationPaiment
│  │  │  └─ ConfirmationPaiment.jsx
│  │  ├─ ForgotPassword
│  │  │  └─ ForgotPassword.jsx
│  │  ├─ Home
│  │  │  └─ HomeScreen.jsx
│  │  ├─ Login
│  │  │  └─ Login.jsx
│  │  ├─ MyTickets
│  │  │  └─ MyTickets.jsx
│  │  ├─ NFCValidationScreen
│  │  │  └─ NFCValidationScreen.jsx
│  │  ├─ Paiment
│  │  │  └─ Paiment.jsx
│  │  ├─ QRValidationScreen
│  │  │  └─ QRValidationScreen.jsx
│  │  ├─ RechargeConfirmationScreen
│  │  │  └─ RechargeConfirmationScreen.jsx
│  │  ├─ RechargePaymentScreen
│  │  │  └─ RechargePaymentScreen.jsx
│  │  ├─ SignUp
│  │  │  └─ SignUp.jsx
│  │  ├─ TicketSelection
│  │  │  └─ TicketSelection.jsx
│  │  ├─ TransactionHistoryScreen
│  │  │  └─ TransactionHistoryScreen.jsx
│  │  ├─ ValidationResultScreen
│  │  │  └─ ValidationResultScreen.jsx
│  │  ├─ ValidationScreen
│  │  │  └─ ValidationScreen.jsx
│  │  ├─ ViewTicket
│  │  │  └─ ViewTicket.jsx
│  │  └─ WalletScreen
│  │     └─ WalletScreen.jsx
│  ├─ Redux
│  │  ├─ Actions
│  │  ├─ Slices
│  │  │  ├─ PurchaseseSlice.js
│  │  │  └─ TicketsSlice.js
│  │  └─ store.js
│  └─ Styles
│     ├─ App.css
│     ├─ Auth.module.css
│     ├─ ConfirmationPaiment.module.css
│     ├─ HomeScreen.module.css
│     ├─ index.css
│     ├─ NFCValidation.module.css
│     ├─ Paiment.module.css
│     ├─ QRValidation.module.css
│     ├─ RechargeConfirmation.module.css
│     ├─ RechargePaymentScreen.module.css
│     ├─ Ticket.module.css
│     ├─ TicketSelection.module.css
│     ├─ TransactionHistoryScreen.module.css
│     ├─ ValidationResult.module.css
│     ├─ ValidationScreen.module.css
│     ├─ ViewTicket.module.css
│     └─ WalletScreen.module.css
├─ tailwind.config.js
├─ TODO.md
└─ vite.config.js

```