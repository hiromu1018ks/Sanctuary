"use client";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Lightbulb, Circle, Sparkles, Edit, CheckCircle, Info } from "lucide-react";

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalContent: string;
  suggestedContent: string;
  onAcceptSuggestion: (content: string) => void;
}

export default function SuggestionModal({
  isOpen,
  onClose,
  originalContent,
  suggestedContent,
  onAcceptSuggestion,
}: SuggestionModalProps) {
  const handleAccept = () => {
    onAcceptSuggestion(suggestedContent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-orange-800">
<Lightbulb className="inline w-5 h-5 mr-2" />
            投稿内容の改善提案
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            より前向きな表現での投稿をご提案します。お気に入りの表現に編集してからご投稿ください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-700">
<Circle className="inline w-4 h-4 mr-2 text-red-600" />
                元の投稿内容
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {originalContent}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-green-700">
<Sparkles className="inline w-4 h-4 mr-2" />
                改善提案
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {suggestedContent}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="sm:order-1">
<Edit className="inline w-4 h-4 mr-2" />
              自分で編集を続ける
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700 text-white sm:order-2"
            >
<CheckCircle className="inline w-4 h-4 mr-2" />
              この提案を使う
            </Button>
          </div>
          <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 mb-1">ご注意</p>
                <p>
                  「この提案を使う」を選択すると、提案内容が投稿フォームに反映されます。
                  <br />
                  まだ投稿は完了していませんので、必要に応じて編集してから「投稿」ボタンを押してください。
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
