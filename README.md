# Tenji Final Project

## Table of Contents
- [Introduction](#introduction)
- [Contributors](#contributors)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Project Setup](#project-setup)
- [Installation and Dependencies](#installation-and-dependencies)
- [Running the Application](#running-the-application)
- [References](#references)

## Introduction
This project is an extension of the Master Thesis project **TENJI** by Pramod Kumar Bonth. The original project is available live at [https://tenji.cs.ovgu.de/](https://tenji.cs.ovgu.de/) and its source code can be found at [https://github.com/pramodbontha/TENJI](https://github.com/pramodbontha/TENJI).

Our work adds functionality for recommending parliamentary speeches to users based on their preferences and search history. For sourcing speeches, we used **Bundestagsmine**, a project by [TheItCrOw](https://github.com/TheItCrOw), which can be accessed at [https://github.com/TheItCrOw/Bundestags-Mine](https://github.com/TheItCrOw/Bundestags-Mine).

The extended version of **TENJI** built in this project can be found at:  
**[https://github.com/journeytoday/tenjifinal](https://github.com/journeytoday/tenjifinal)**

## Contributors
This project is a collaborative effort by:
- [Asmina-hub](https://github.com/Asmina-hub)
- [AyeshaMH](https://github.com/ayeshamh)
- [Imon Ghosh](https://github.com/ImonGhosh)
- [Ishmita Basu](https://github.com/ishmitabasu98)
- [Journey Today](https://github.com/journeytoday)
- [Sandipan Seal](https://github.com/sandipanseal)

## Technologies Used
This project employs the following technologies:
- **React Vite**: For building the frontend with optimized performance.
- **Supabase**: For authentication, database, and serverless backend functionalities.
- **Hugging Face**: To integrate advanced machine learning models for recommendation logic and NLP.
- **Bundestagsmine**: To source and retrieve parliamentary speeches for recommendations ([https://bundestag-mine.de/](https://bundestag-mine.de/)).
- **TENJI** : Main inspiration for the site. ([https://tenji.cs.ovgu.de/](https://tenji.cs.ovgu.de/))

## Features
- **Parliamentary Speech Recommendations**: Users receive personalized speech recommendations based on their search history and preferences.
- **Search-Driven Insights**: Intelligent filtering and ranking of speeches using natural language processing models from Hugging Face.
- **Data Integration**: Seamless integration with **Bundestagsmine** for accessing German parliamentary speeches.

## Project Setup
To set up this project locally:

1. **Create a directory for the project**  
   ```
   mkdir project
   ```

2. **Navigate to the directory**  
   ```
   cd project
   ```

3. **Clone the repository**  
   ```
   git clone https://github.com/journeytoday/tenjifinal.git
   ```

## Installation and Dependencies
Install the required libraries and dependencies:
```
npm i
```

### Configurations
Create a `.env` file in the root directory and configure the following:
- **Supabase**:
  ```
  SUPABASE_URL=<your_supabase_url>
  SUPABASE_ANON_KEY=<your_supabase_anon_key>
  ```
- **Hugging Face**:
  ```
  HUGGINGFACE_API_KEY=<your_hugging_face_api_key>
  ```
- **Bundestagsmine API**: Ensure you have access to the API or scrape the data using the resources provided in [https://github.com/TheItCrOw/Bundestags-Mine](https://github.com/TheItCrOw/Bundestags-Mine).

## Running the Application
To start the application:
```
npm run dev
```

The application will be available on your local development server (e.g., `http://localhost:5173`).

## References
- TENJI live project: [https://tenji.cs.ovgu.de/](https://tenji.cs.ovgu.de/)
- TENJI original repository: [https://github.com/pramodbontha/TENJI](https://github.com/pramodbontha/TENJI)
- TENJI extended repository: [https://github.com/journeytoday/tenjifinal](https://github.com/journeytoday/tenjifinal)
- Bundestagsmine project: [https://github.com/TheItCrOw/Bundestags-Mine](https://github.com/TheItCrOw/Bundestags-Mine)
- Bundestagsmine live: [https://bundestag-mine.de/](https://bundestag-mine.de/)
- [React Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Hugging Face Documentation](https://huggingface.co/docs)

## Notes
For any issues or questions, reach out to the contributors through their GitHub profiles. This project aims to provide personalized recommendations using cutting-edge tools and data resources. Happy exploring!
