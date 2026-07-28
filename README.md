# Ders Programı

A complete, standalone School Scheduling application built with **Go**, **Wails**, and **React**.

## Features
- **Interactive Drag & Drop Calendar**: Easily manage your weekly schedule.
- **Collision Detection**: Automatically prevents overlapping classes for the same teacher or branch.
- **Dynamic PDF Printing**: Designed to export a visually pleasing, cleanly formatted PDF of your schedule.
- **Automated Scheduling**: A smart algorithm that efficiently packs your classes into the week.
- **Standalone Portable App**: Your data (`data.json`) and executable (`ders-programi.exe`) travel together—no complex installations needed!

## How to Use
1. Keep the `ders-programi.exe` and `data.json` files together in the same folder.
2. Double click the `.exe` file to start the application.
3. Manage teachers (Hocalar), branches (Şubeler), and Zoom links from the "Veri Yönetimi" (Data Management) screen.
4. Drag and drop to manually schedule, or click "Otomatik Oluştur" for automatic scheduling.
5. Click "Yazdır" to generate a beautiful PDF export of your timetable.

## Development
This app is built using Wails v3.
- To run in development mode with hot-reloading: `task dev`
- To build a production executable: `task build` (or `wails3 build`)
