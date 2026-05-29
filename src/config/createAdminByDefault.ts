import { UserService } from "../services/UserService";
import { Roles } from "../constants";
import { Config } from "../config";
import logger from "../config/logger";
import { AppDataSource } from "./data-source";
import { User } from "../entity/User";

export const createAdminByDefault = async () => {
    const userRepository = AppDataSource.getRepository(User);
    const userService = new UserService(userRepository);

    const existingAdmin = await userService.findByEmailWithPassword(
        Config.ADMIN_EMAIL as string,
    );

    if (existingAdmin) {
        logger.info("Admin user already exists. Skipping creation.");
        return;
    }

    const adminUser = await userService.create({
        firstName: Config.ADMIN_FIRST_NAME as string,
        lastName: Config.ADMIN_LAST_NAME as string,
        email: Config.ADMIN_EMAIL as string,
        password: Config.ADMIN_PASSWORD as string,
        role: Roles.ADMIN,
    });

    logger.info("Admin user created successfully.", {
        id: adminUser.id,
        email: adminUser.email,
    });
};
