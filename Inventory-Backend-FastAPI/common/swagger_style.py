from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse

LIGHT_CSS = """
<style>
/* Antigravity Light Swagger Theme */
body {
    background-color: #f8fafc !important;
    margin: 0;
}

.swagger-ui {
    background-color: #f8fafc !important;
}

.swagger-ui .info .title {
    color: #4f46e5 !important; /* Premium Indigo */
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 32px !important;
    font-weight: 700 !important;
    margin-top: 20px;
}

.swagger-ui .scheme-container {
    background: white !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
    border-radius: 12px;
    margin: 20px 0;
    padding: 20px !important;
    border: 1px solid rgba(0,0,0,0.05);
}

.swagger-ui .opblock {
    border-radius: 12px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0,0,0,0.05) !important;
    margin-bottom: 12px;
}

/* Custom Authorize button */
.swagger-ui .btn.authorize {
    border-color: #4f46e5;
    color: #4f46e5;
    border-radius: 10px;
    font-weight: 700;
    background-color: white;
}

.swagger-ui .btn.authorize:hover {
    background-color: #f5f3ff;
}

/* Fix code blocks */
.swagger-ui .microlight {
    background: #f1f5f9 !important;
    color: #1e293b !important;
    border-radius: 10px;
    padding: 16px !important;
    border: 1px solid rgba(0,0,0,0.05);
}

.swagger-ui .topbar {
    background-color: #ffffff !important;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}
</style>
"""

def add_custom_swagger(app, title: str = "Antigravity API Docs"):
    """Enable a custom premium theme for Swagger UI."""
    @app.get("/docs", include_in_schema=False)
    async def custom_swagger_ui_html():
        response = get_swagger_ui_html(
            openapi_url=app.openapi_url,
            title=title,
            swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
            swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
            swagger_ui_parameters={"syntaxHighlight.theme": "monokai"},
        )
        html = response.body.decode()
        html = html.replace("</head>", f"{LIGHT_CSS}</head>")
        return HTMLResponse(html)

# Alias for backward compatibility if needed, but we'll update the services
add_dark_swagger = add_custom_swagger
