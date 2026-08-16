import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Get frontend URL from env for CORS
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // Enable CORS
    app.enableCors({
        origin: frontendUrl,
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // API prefix
    app.setGlobalPrefix("api/v1");

    // Swagger Documentation
    const config = new DocumentBuilder()
        .setTitle("CivicVoice API")
        .setDescription("Public Complaints & Feedback Portal API")
        .setVersion("1.0")
        .addBearerAuth()
        .addTag("auth", "Authentication endpoints")
        .addTag("complaints", "Complaint management")
        .addTag("users", "User management")
        .addTag("categories", "Category management")
        .addTag("departments", "Department management")
        .addTag("feedback", "Feedback submissions")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);

    const port = process.env.PORT || 4000;
    await app.listen(port);

    console.log(`
        ╔═══════════════════════════════════════════════════════╗
        ║                                                       ║
        ║   CivicVoice API is running!                          ║
        ║                                                       ║
        ║   API Docs: http://localhost:${port}/api/docs        ║
        ║   API Base: http://localhost:${port}/api/v1          ║
        ║                                                       ║
        ╚═══════════════════════════════════════════════════════╝
        `);
}

bootstrap();