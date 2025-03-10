import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Paperclip } from "lucide-react";

type Props = {
  attachments: {
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
    headers: any;
  }[];
  setSelectedAttachment: (attachment: {
    id: string;
    name: string;
    type: string;
    url: string;
  }) => void;
};

const AttachmentsAccordion = ({ attachments, setSelectedAttachment }: Props) => {
  return (
    <div className="px-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="attachments" className="border-0">
          <AccordionTrigger className="px-2 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <Paperclip className="text-muted-foreground h-4 w-4" />
              <h3 className="text-sm font-medium">Attachments ({attachments.length})</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.attachmentId}
                  className="w-48 flex-shrink-0 overflow-hidden rounded-md border transition-shadow hover:shadow-md"
                >
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      setSelectedAttachment({
                        id: attachment.attachmentId,
                        name: attachment.filename,
                        type: attachment.mimeType,
                        url: attachment.headers["content-location"],
                      })
                    }
                  >
                    <div className="bg-muted flex h-24 items-center justify-center">
                      {attachment.mimeType.includes("image") ? (
                        <img
                          src={attachment.headers["content-location"] || "/placeholder.svg"}
                          alt={attachment.filename}
                          className="max-h-full max-w-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground text-2xl">
                          {attachment.mimeType === "application/pdf" && "📄"}
                          {attachment.mimeType ===
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
                            "📊"}
                          {attachment.mimeType ===
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
                            "📝"}
                          {![
                            "application/pdf",
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                            "image",
                          ].includes(attachment.mimeType) && "📎"}
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-sm font-medium">{attachment.filename}</p>
                      <p className="text-muted-foreground text-xs">{attachment.size}</p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AttachmentsAccordion;
