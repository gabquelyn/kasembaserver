import express, {Express, Request, Response} from 'express';
import dotenv from 'dotenv';
import path from 'path'

dotenv.config()
const app: Express = express();
const port = process.env.PORT || 8080;

app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/', (req: Request, res: Response) => {
    res.send("Express and typescript server");
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})