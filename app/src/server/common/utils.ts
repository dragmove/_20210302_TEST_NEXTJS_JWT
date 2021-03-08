/*
// TODO: Check
export function setupCloseOnExit(server) {
  async function handleClose() {
    await server
      .close()
      .then(() => {
        console.log('Served closed');

        // TODO: Check event
        process.exit();
      })
      .catch(() => {
        console.warn('Failed to close server');
      });
  }

  const events = ['exit', 'SIGINT', 'uncaughtException', , 'SIGUSR1', 'SIGUSR2'];
  events.forEach((evt) => {
    process.on(evt, handleClose);
  });
}
*/
