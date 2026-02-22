import React from 'react';
import { X, Download, Dumbbell } from 'lucide-react';
import html2canvas from 'html2canvas';

// ===============================
// CANVAS BARCODE COMPONENT (FIXED)
// ===============================
interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  margin?: number;
  className?: string;
}

const Barcode: React.FC<BarcodeProps> = ({
  value,
  width = 2,
  height = 60,
  displayValue = true,
  fontSize = 12,
  background = "#ffffff",
  lineColor = "#000000",
  margin = 10,
  className = ""
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Patterns for digits
    const patterns: Record<string, number[]> = {
      "0": [2, 1, 2, 2, 2, 2],
      "1": [2, 2, 2, 1, 2, 2],
      "2": [2, 2, 2, 2, 2, 1],
      "3": [1, 2, 1, 2, 2, 3],
      "4": [1, 2, 1, 3, 2, 2],
      "5": [1, 3, 1, 2, 2, 2],
      "6": [1, 2, 2, 2, 1, 3],
      "7": [1, 2, 2, 3, 1, 2],
      "8": [1, 3, 2, 2, 1, 2],
      "9": [2, 2, 1, 2, 1, 3]
    };

    // Full barcode pattern
    const pattern: number[] = [1, 1, 1, 1];
    for (const char of value) pattern.push(...(patterns[char] || patterns["0"]));
    pattern.push(1, 1, 1, 1);

    const totalWidth = pattern.reduce((s, w) => s + w, 0) * width + margin * 2;

    canvas.width = totalWidth;
    canvas.height = height + (displayValue ? fontSize + 10 : 0);

    // White background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    let x = margin;
    ctx.fillStyle = lineColor;

    pattern.forEach((barWidth, i) => {
      if (i % 2 === 0) {
        ctx.fillRect(x, 0, barWidth * width, height);
      }
      x += barWidth * width;
    });

    // Text
    if (displayValue) {
      ctx.fillStyle = lineColor;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText(value, canvas.width / 2, height + fontSize);
    }
  }, [value, width, height]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
};
// ----------------------------------
// MEMBER CARD MODAL WITH BARCODE FIX
// ----------------------------------

interface MemberCardModalProps {
  member: {
    id: string;
    name: string;
    checkinCode: string;
    startDate: string;
  };
  gym: {
    name: string;
    logo?: string;
  };
  onClose: () => void;
  onDownload: () => void;
}

const MemberCardModal: React.FC<MemberCardModalProps> = ({ 
  member, 
  gym, 
  onClose, 
  onDownload 
}) => {

  const handleDownload = async () => {
    const cardElement = document.getElementById(`member-card-${member.id}`);

    if (!cardElement) return;

    const canvas = await html2canvas(cardElement, {
      scale: 3,
      backgroundColor: null,
      useCORS: true,
    });

    const image = canvas.toDataURL("image/png", 1.0);

    const link = document.createElement("a");
    link.download = `member-card-${member.name}.png`;
    link.href = image;
    link.click();

    onDownload();
  };

  const joinDate = new Date(member.startDate);
  const sinceText = `SINCE ${(joinDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${joinDate.getFullYear()}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Member Card - {member.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="p-6">
          <div className="flex justify-center">

            <div
              id={`member-card-${member.id}`}
              className="w-[350px] h-[220px] bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-600 rounded-xl p-6 relative shadow-xl"
            >
              {/* Top */}
              <div className="flex justify-between items-center mb-4">
                <div className="text-white font-bold text-base">
                  {gym?.name || "GYM"}
                </div>

                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  {gym?.logo ? (
                    <img src={gym.logo} className="w-7 h-7" />
                  ) : (
                    <Dumbbell className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>

              {/* Member Name */}
              <div className="text-white font-bold text-2xl mb-1 tracking-wide">
                {member.name}
              </div>

              <div className="text-gray-400 text-xs tracking-wide mb-3">
                MEMBERSHIP CARD
              </div>

              {/* Bottom Section */}
              <div className="flex justify-between items-end mt-auto">
                <div className="text-gray-500 text-xs">{sinceText}</div>

                {/* FIXED BARCODE */}
                <div className="scale-125 origin-bottom-right">
                  <Barcode
                    value={member.checkinCode}
                    width={2}
                    height={35}
                    fontSize={12}
                    displayValue={true}
                    background="#ffffff"
                    lineColor="#000000"
                    margin={4}
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg"
            >
              Cancel
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Card</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};


// export default MemberCardDemo;
export { Barcode, MemberCardModal };