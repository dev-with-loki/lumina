"use client";

import useDrivePicker from "react-google-drive-picker";
import { useEffect } from "react";

interface DriveFolderPickerProps {
    accessToken: string;
    onFolderSelected: (folderId: string, folderName: string) => void;
    onClose?: () => void;
}

export default function DriveFolderPicker({
    accessToken,
    onFolderSelected,
    onClose,
}: DriveFolderPickerProps) {
    const [openPicker] = useDrivePicker();

    useEffect(() => {
        if (!accessToken) return;

        const handleOpenPicker = () => {
            openPicker({
                clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                developerKey: process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY!,
                token: accessToken,
                showUploadView: false,
                showUploadFolders: false,
                supportDrives: true,
                multiselect: false,
                viewId: "FOLDERS",
                callbackFunction: (data) => {
                    if (data.action === "cancel") {
                        onClose?.();
                    } else if (data.action === "picked") {
                        const folder = data.docs[0];
                        if (folder) {
                            onFolderSelected(folder.id, folder.name);
                        }
                    }
                },
            });
        };

        handleOpenPicker();
    }, [accessToken, openPicker, onFolderSelected, onClose]);

    return null;
}
