import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import path from 'path';
import logger from './middlewares/logger';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors';
import corsOptions from './config/corsOptions';

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 8080;

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/', (req: Request, res: Response) => {
    res.send("Express and typescript server");
})

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})