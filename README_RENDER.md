# 🚀 Deploying GridPulse to Render — Step-by-Step Guide

This guide provides a comprehensive, step-by-step walkthrough for deploying the **GridPulse** application to **Render**.

Thanks to production-grade optimizations, the entire application (both the **FastAPI backend** and the **compiled React frontend**) runs as a **single consolidated service** within Render's **Free Tier (<512 MB RAM)**.

---

## 🏗️ Consolidated Architecture

In production, the FastAPI backend is configured to statically serve the compiled React frontend from the `web/` directory at the root URL `/`. 
* **One Service**: You only need to deploy **one** Render Web Service.
* **Zero CORS Issues**: Because the frontend and backend are served from the same domain, there are no CORS (Cross-Origin Resource Sharing) or cookie blocking issues.
* **Auto-Ingestion**: On startup, GridPulse will automatically detect if the database is empty and auto-populate it with 1,000 anonymized historical incident records so that the dashboard is instantly active.

---

## 🛠️ Prerequisites

Before you deploy, make sure you have:
1. A **GitHub repository** containing the GridPulse code (committed and pushed to your GitHub account).
2. A **Render account** (sign up for free at [render.com](https://render.com/)).
3. *(Optional)* A **Google Gemini API Key** to enable the AI Copilot chat features. If not provided, the assistant will automatically fall back to offline TF-IDF RAG mode.

---

## 🎯 Method 1: Render Blueprints (Recommended & Easiest)

Render Blueprints use the pre-configured `render.yaml` file in the root of the project to automatically configure and spin up the service.

1. **Log in** to your [Render Dashboard](https://dashboard.render.com/).
2. Click the **New +** button in the top right and select **Blueprint**.
3. Connect your GitHub account (if not already done) and select your **GridPulse** repository.
4. Render will read `render.yaml` and prompt you for configuration:
   * **Service Group Name**: Choose a name (e.g., `gridpulse-deployment`).
   * **`GEMINI_API_KEY`**: Enter your Google Gemini API Key. *(If you do not have one, you can enter a placeholder or leave it blank to use the offline TF-IDF fallback)*.
5. Click **Approve**.
6. Render will automatically create the web service, build the dependencies, and deploy the application.

---

## ⚙️ Method 2: Manual Web Service Setup

If you prefer to configure the deployment manually in the Render UI:

1. **Log in** to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your **GridPulse** repository.
4. In the configuration form, set the following fields:
   * **Name**: `gridpulse` (or your preferred service name)
   * **Region**: Choose a region close to your target users (e.g., *Singapore*, *Oregon*, or *Frankfurt*)
   * **Branch**: `main` (or your production branch)
   * **Runtime**: `Python`
   * **Build Command**: 
     ```bash
     pip install -r requirements-production.txt
     ```
   * **Start Command**: 
     ```bash
     python run_server.py
     ```
   * **Instance Type**: Select the **Free** plan.
5. Click **Advanced** at the bottom of the page and add the following **Environment Variables**:

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `HOST` | `0.0.0.0` | Binds the Uvicorn server to all network interfaces |
   | `PYTHON_VERSION` | `3.10.12` | Ensures Render uses Python 3.10+ |
   | `GEMINI_API_KEY` | `your_gemini_key_here` | *(Optional)* Enables Gemini-powered RAG AI Copilot |

6. Click **Create Web Service**.

---

## 💾 Persisting the SQLite Database (Optional)

Render's Free Tier instances have an **ephemeral filesystem**, meaning any files created or modified (including the `gridpulse.db` SQLite database) will be lost when the instance restarts, sleeps, or is re-deployed.

To keep your database persistent across restarts and redeploys, you can mount a **Render Persistent Disk**:

> [!NOTE]
> Setting up a persistent disk requires upgrading your web service plan from Free to a paid tier (e.g., Starter, which is $7/month). If you stay on the Free tier, GridPulse remains fully functional but will re-ingest the default historical records on every reboot.

### How to Attach a Persistent Disk:
1. Go to your GridPulse service dashboard on Render.
2. In the left navigation menu, click **Disks**.
3. Click **Add Disk**.
4. Configure the disk settings:
   * **Name**: `gridpulse-db-volume`
   * **Mount Path**: `/data`
   * **Size**: `1 GB` (More than enough for SQLite)
5. Click **Create Disk**.
6. Go to **Environment Variables** in the left navigation menu and add:
   * **Key**: `GRIDPULSE_DB_PATH`
   * **Value**: `/data/gridpulse.db`
7. Click **Save Changes**. Render will automatically restart your service, mounting the disk and saving your database to persistent storage.

---

## 🔍 Verification & Troubleshooting

Once your deployment is complete:

1. **Verify Live URL**: Render will display your public URL at the top of the service page (e.g., `https://gridpulse.onrender.com`). Open this URL in your browser to access the GridPulse Command Center dashboard.
2. **FastAPI Swagger Docs**: Visit `https://your-service.onrender.com/docs` to test endpoints and interact with the API schema.
3. **Check Build & Run Logs**:
   * If the service fails to build or start, check the **Events** and **Logs** tabs on Render.
   * If you encounter memory issues, ensure you are using `requirements-production.txt` rather than `requirements.txt` to build. The production requirements exclude heavy visual libraries and utilize pre-stubbed ML libraries to keep RAM usage well under the **512 MB** limit.
