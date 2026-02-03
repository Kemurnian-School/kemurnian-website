interface Item {
  title: string;
}

interface ConfirmationModalProps {
  item: Item;
  onConfirm: () => void;
  onCancel: () => void;
}

const overlay = "fixed w-full h-full bg-black/75";
const card = "w-40 h-20 bg-white rounded-md shadow-xl"
const button = "px-3 py-2"

export default function ConfirmationModal({
  item,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  return (
    <main className={overlay}>
      <div className={card}>
        Are you sure you want to delete this ${item.title}
        <div>
          <button className={`${button} bg-red-700`}>Cancel</button>
          <button className={`${button} bg-green-600`}>Confirm</button>
        </div>
      </div>

    </main>
  )

}
