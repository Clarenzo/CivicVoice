import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ComplaintsModule } from "./complaints/complaints.module";
import { CategoriesModule } from "./categories/categories.module";
import { DepartmentsModule } from "./departments/departments.module";
import { FeedbackModule } from "./feedback/feedback.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        ComplaintsModule,
        CategoriesModule,
        DepartmentsModule,
        FeedbackModule,
        NotificationsModule,
    ],
})

export class AppModule {}