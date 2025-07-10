import { useQRCode } from "next-qrcode";

interface QRCodeCardProps {
  uid: string;
  className?: string;
}

export function QRCodeCard({ uid, className }: QRCodeCardProps) {
  const { Canvas } = useQRCode();

  return (
    <div className={`items-center my-6 ${className}`}>
      {/* <span className="mb-2 font-semibold">Your QR Code</span> */}
      <Canvas
        text={uid}
        options={{
          errorCorrectionLevel: "M",
          margin: 4,
          scale: 4,
          width: 200,
          // color: {
          //   dark: '#010599FF',
          //   light: '#FFBF60FF',
          // },
        }}
      />
    </div>
  );
}
