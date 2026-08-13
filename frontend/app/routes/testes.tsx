export default function TestPage() {
    function handleTestBackend() {

    }

    return (
        <div className="p-6 text-white">
            <h1 className="text-2xl font-bold mb-6">Playground de Testes</h1>

            <button
                onClick={handleTestBackend}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
            >
                Disparar Método
            </button>
        </div>
    );
}