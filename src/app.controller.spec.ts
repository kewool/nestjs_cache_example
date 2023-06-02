import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CacheModule, CacheInterceptor } from "@nestjs/cache-manager";
import { APP_INTERCEPTOR } from "@nestjs/core";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({
          ttl: 3000,
          isGlobal: true,
        }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: APP_INTERCEPTOR,
          useClass: CacheInterceptor,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it("should return same value", () => {
      const cached_value = appController.getHello();
      expect(appController.getHello()).toStrictEqual(cached_value);
    });

    it("should return different value", async () => {
      const cached_value = await appController.getHello();
      await new Promise((r) => setTimeout(r, 3000));
      expect(await appController.getHello()).not.toStrictEqual(cached_value);
    });
  });
});
