import { PORT } from './src/config/env.js';
import { createApp } from './src/app.js';

const app = createApp();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
