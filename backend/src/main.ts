import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as os from 'os';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware para logar todas as requisições
  app.use((req: any, res: any, next: any) => {
    const timestamp = new Date().toISOString();
    console.log(`\n📥 [${timestamp}] ${req.method} ${req.url}`);
    console.log(`   Origin: ${req.headers.origin || '(sem origin)'}`);
    console.log(`   Host: ${req.headers.host || '(sem host)'}`);
    console.log(`   User-Agent: ${req.headers['user-agent']?.substring(0, 50) || '(sem UA)'}`);
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS: aceita qualquer origem (navegador, app Capacitor com origin null ou capacitor://localhost)
  app.enableCors({
    origin: (origin, callback) => {
      // Permite requisições sem origin (ex.: app Android, Postman)
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  console.log('✅ CORS habilitado (qualquer origem)\n');

  const config = new DocumentBuilder()
    .setTitle('Patrimônio - API')
    .setDescription('API do Sistema de Gerenciamento de Patrimônio Institucional')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);
  
  // Obter IPs da máquina para exibir
  const networkInterfaces = os.networkInterfaces();
  const localIPs: string[] = [];
  Object.keys(networkInterfaces).forEach((iface) => {
    const addresses = networkInterfaces[iface];
    if (addresses) {
      addresses.forEach((addr) => {
        // Em versões recentes de Node, family é string ('IPv4' | 'IPv6')
        const isIPv4 = addr.family === 'IPv4';
        if (isIPv4 && !addr.internal) {
          localIPs.push(addr.address);
        }
      });
    }
  });
  
  console.log(`\n🚀 Backend rodando:`);
  console.log(`   Local:   http://localhost:${port}`);
  if (localIPs.length > 0) {
    console.log(`   Rede:    http://${localIPs[0]}:${port}`);
    if (localIPs.length > 1) {
      localIPs.slice(1).forEach(ip => {
        console.log(`            http://${ip}:${port}`);
      });
    }
  }
  console.log(`   Swagger: http://localhost:${port}/api/docs\n`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
