import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";
import { HomeIcon, CompassIcon } from "lucide-react";

export function NotFound() {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
            <Empty>
                <EmptyHeader>
                    <EmptyTitle className="font-extrabold text-9xl bg-gradient-to-b from-white via-white/80 to-transparent bg-clip-text text-transparent [mask-image:linear-gradient(to_bottom,black_20%,transparent_80%)]">
                        404
                    </EmptyTitle>
                    <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
                        The page you&apos;re looking for might have been <br />
                        moved or doesn&apos;t exist.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <div className="flex gap-2">
                        <Button asChild>
                            <a href="/">
                                <HomeIcon className="size-4 mr-2" />
                                Go Home
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href="/components">
                                <CompassIcon className="size-4 mr-2" />
                                Explore
                            </a>
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    );
}

export default NotFound;
