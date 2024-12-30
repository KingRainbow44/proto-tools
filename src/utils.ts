import { lstat, unlink, readdir } from "node:fs/promises";
import { BunFile } from "bun";

export class Arguments {
    /**
     * Returns the argument at the specified position.
     *
     * @param position The index of the argument. 0 represents the first argument.
     * @param fallback The value to return if the argument is not found.
     */
    public static get<T>(position: number, fallback?: T | undefined): T | null {
        return process.argv[position + 2] as T ?? fallback ?? null;
    }

    /**
     * Throws an error if the argument at the specified position is not found.
     *
     * @param position The index of the argument. 0 represents the first argument.
     * @param message The error message to throw.
     */
    public static throw<T>(position: number, message: string): T {
        const value = this.get<T>(position);
        if (value === null) {
            throw new Error(message);
        }

        return value as T;
    }
}

export class Files {
    /**
     * Throws an error if the specified path is not a file.
     *
     * @param path The path to the file.
     * @param message The error message to throw.
     */
    public static async dirThrow(path: string, message: string): Promise<void> {
        const stats = await lstat(path);
        if (!stats.isDirectory()) {
            throw new Error(message);
        }
    }

    /**
     * Deletes a file if it already exists.
     *
     * @param path The path to the file.
     */
    public static async rmExists(path: string): Promise<void> {
        const file = Bun.file(path);
        if (await file.exists()) {
            await unlink(path);
        }
    }

    /**
     * Returns a list of relative paths to the files in the specified directory.
     *
     * @param path The path to the directory.
     * @param ext The extension the file must match.
     */
    public static async listDir(path: string, ext?: string | undefined): Promise<string[]> {
        return (await readdir(path))
            .filter((file) => ext === undefined || file.endsWith(ext))
            .map((file) => `${path}/${file}`);
    }

    /**
     * Returns a list of Bun file handles for the files in the specified directory.
     *
     * @param path The path to the directory.
     * @param ext The extension the file must match.
     */
    public static async readDir(path: string, ext?: string | undefined): Promise<BunFile[]> {
        return (await Files.listDir(path, ext))
            .map((file) => Bun.file(file));
    }
}