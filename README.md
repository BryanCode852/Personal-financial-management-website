Link to access: https://bryancode852.github.io/Personal-financial-management-website/

It is a no backend web application, designed to help users manage their personal finances, track income and expenses, and set financial goals

Features
 1. User Authentication: The user name, password and verification code are hard coded
 2. Financial Dashboard: Summary of income, expenses and balance (cards), charts, goals, latest transaction and real time currency conversion (HKD, USD, JPY, GBP and EUR).
 3. Calendar-Based Entry: Add and view transactions on a calendar, supporting CSV import for bulk entries.
 4. Goals Management: Set savings/spending goals with progress tracking and achievement status.
 5. Light/Dark Mode: Stylish themes for better usability day and night.

Usage
1. Open login.html.
2. If you do not want to experience registration, the username is "bryan123" and the password is "bryan123".

File Struture

.
└── code/

    ├── function/
    │   ├── login.js
    │   ├── regist.js
    │   ├── pwreset.js
    │   ├── main.js
    │   ├── dataEntry.js
    │   ├── charts.js
    │   └── goals.js
    ├── pic/
    │   ├── logo_lightmode.png
    │   ├── logo_lightmode_vertical.png
    │   └── logo_lightmode_vertical_s.png
    ├── style/
    │   ├── loginStyle.css
    │   ├── registStyle.css
    │   ├── pwresetStyle.css
    │   ├── mainStyle.css
    │   ├── dataEntryStyle.css
    │   ├── chartsStyle.css
    │   └── goalsStyle.css
    ├── login.html
    ├── regist.html
    ├── pwreset.html
    ├── main.html
    ├── dataEntry.html
    ├── charts.html
    └── goals.html
