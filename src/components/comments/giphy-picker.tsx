import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface GiphyImage {
	id: string;
	title: string;
	images: {
		fixed_height: {
			url: string;
			width: string;
			height: string;
		};
		original: {
			url: string;
		};
		preview_gif: {
			url: string;
		};
	};
}

interface GiphyResponse {
	data: GiphyImage[];
}

interface GiphyPickerProps {
	onSelect: (url: string) => void;
	trigger?: React.ReactNode;
	disabled?: boolean;
}

// Get API key from env, or null if not configured
const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY || null;

async function searchGifs(query: string): Promise<GiphyImage[]> {
	if (!GIPHY_API_KEY) {
		throw new Error("GIPHY_API_KEY not configured");
	}

	const endpoint = query
		? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=pg-13`
		: `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=pg-13`;

	const response = await fetch(endpoint);
	if (!response.ok) {
		const errorText = await response.text();
		console.error("Giphy API error:", response.status, errorText);
		throw new Error("Failed to fetch GIFs");
	}

	const data: GiphyResponse = await response.json();
	return data.data;
}

export function GiphyPicker({ onSelect, trigger, disabled }: GiphyPickerProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Debounce search input
	useEffect(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}
		timerRef.current = setTimeout(() => {
			setDebouncedSearch(search);
		}, 300);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, [search]);

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearch(e.target.value);
		},
		[],
	);

	const {
		data: gifs,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["giphy", debouncedSearch],
		queryFn: () => searchGifs(debouncedSearch),
		enabled: open && !!GIPHY_API_KEY,
		staleTime: 1000 * 60 * 5, // Cache for 5 minutes
		retry: false,
	});

	const handleSelect = useCallback(
		(gif: GiphyImage) => {
			onSelect(gif.images.fixed_height.url);
			setOpen(false);
			setSearch("");
			setDebouncedSearch("");
		},
		[onSelect],
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				{trigger || (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-8 px-2 text-muted-foreground hover:text-foreground"
						disabled={disabled}
					>
						GIF
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent
				className="w-80 p-0"
				align="start"
				side="top"
				sideOffset={8}
			>
				<div className="p-3 border-b border-border">
					<div className="relative">
						<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search GIPHY..."
							value={search}
							onChange={handleSearchChange}
							className="pl-8 h-9"
						/>
					</div>
				</div>
				<ScrollArea className="h-64">
					<div className="p-2">
						{isLoading ? (
							<div className="grid grid-cols-2 gap-2">
								{Array.from({ length: 6 }).map((_, i) => (
									<Skeleton
										key={`skeleton-${
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											i
										}`}
										className="aspect-video rounded-md"
									/>
								))}
							</div>
						) : !GIPHY_API_KEY ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<p className="text-sm text-muted-foreground">
									GIF search not configured.
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									Add VITE_GIPHY_API_KEY to enable.
								</p>
							</div>
						) : error ? (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<p className="text-sm text-destructive">Failed to load GIFs</p>
								<p className="text-xs text-muted-foreground mt-1">
									Please try again later.
								</p>
							</div>
						) : gifs && gifs.length > 0 ? (
							<div className="grid grid-cols-2 gap-2">
								{gifs.map((gif) => (
									<button
										key={gif.id}
										type="button"
										onClick={() => handleSelect(gif)}
										className={cn(
											"relative aspect-video overflow-hidden rounded-md",
											"ring-offset-background transition-all",
											"hover:ring-2 hover:ring-primary hover:ring-offset-2",
											"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
										)}
									>
										<img
											src={gif.images.fixed_height.url}
											alt={gif.title}
											className="h-full w-full object-cover"
											loading="lazy"
										/>
									</button>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<p className="text-sm text-muted-foreground">
									{debouncedSearch
										? "No GIFs found"
										: "Loading trending GIFs..."}
								</p>
							</div>
						)}
					</div>
				</ScrollArea>
			</PopoverContent>
		</Popover>
	);
}
