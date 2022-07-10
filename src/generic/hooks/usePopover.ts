import { ReactNode, useState } from "react";

export type PopoverData = {
    popoverProps: {
        open: boolean;
        anchorEl: HTMLElement | null;
        onClose: () => void;
        children: ReactNode;
    };
    openPopover: (anchor: HTMLElement, content: ReactNode) => void;
    closePopover: () => void;
}

export function usePopover(): PopoverData {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const [content, setContent] = useState<ReactNode>(null);

    const isOpen = !!anchor;

    const open = (anchor: HTMLElement, content: ReactNode) => {
        setAnchor(anchor);
        setContent(content);
    };
    const close = () => {
        setAnchor(null);
        setContent(null);
    }

    return {
        popoverProps: {
            open: isOpen, anchorEl: anchor, onClose: close, children: content,
        },
        openPopover: open,
        closePopover: close
    };
}
