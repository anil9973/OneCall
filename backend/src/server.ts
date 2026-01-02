import { buildApp } from "./app.ts";

async function start() {
	const app = await buildApp();

	try {
		const port = app.config.PORT;
		const host = app.config.HOST;

		await app.listen({ port, host });

		app.log.info(`🚀 Server listening on http://${host}:${port}`);
		app.log.info(`📊 Environment: ${app.config.NODE_ENV}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
}

start();
