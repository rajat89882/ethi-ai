import Sidebar from '../components/Sidebar';
import { Trash2, Eye } from 'lucide-react'; // Import Eye icon for preview
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';


const Dashboard = () =>
{
    const [quizzes, setQuizzes] = useState([]);


    const navigate = useNavigate();

    useEffect(() =>
    {
        const fetchQuizzes = async () =>
        {
            try
            {
                const response = await axios.get('https://api.ethiai.io/api/quizzes');
                setQuizzes(response.data.data);
            } catch (error)
            {
                console.error('Error fetching quizzes:', error);
            }
        };

        fetchQuizzes();
    }, []);

    const handleCreateNewQuiz = () =>
    {
        navigate('/quiz');
    };

    const handleViewQuiz = (documentId) =>
    {
        navigate(`/view-quiz/${documentId}`);
    };

    // const handleEditQuiz = (documentId: string) => {
    //     navigate(`/edit-quiz/${documentId}`);
    // };

    const handleDeleteQuiz = async (documentId) =>
    {
        try
        {
            await axios.delete(`https://api.ethiai.io/api/quizzes/${documentId}`);
            setQuizzes((prevQuizzes) => prevQuizzes.filter((quiz) => quiz.documentId !== documentId));
        } catch (error)
        {
            console.error('Error deleting quiz:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
                    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <h3 className="text-primary text-2xl sm:text-3xl mt-12 lg:mt-0 font-bold mb-2 sm:mb-0">Dashboard</h3>
                            <button className="px-4 py-2 bg-primary text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 w-full sm:w-auto" onClick={handleCreateNewQuiz}>
                                Create New Quiz
                            </button>
                        </div>
                        {quizzes.map((quiz) => (
                            <div key={quiz.documentId} className="bg-white border-2 border-primary p-4 mb-4 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                    <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                                        <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 border-gray-300 rounded" />
                                        <h2 className="text-lg font-medium text-gray-900">{quiz.quizTitle}</h2>
                                    </div>
                                    <div className="flex space-x-2">
                                        {/* <button className="p-1 text-secondary hover:text-primary" onClick={() => handleEditQuiz(quiz.documentId)}>
                                            <Edit size={20} />
                                        </button> */}
                                        <button className="p-1 text-secondary hover:text-primary" onClick={() => handleViewQuiz(quiz.documentId)}>
                                            <Eye size={20} />
                                        </button>
                                        <button className="p-1 text-primary hover:text-secondary rounded-full border-2 border-primary" onClick={() => handleDeleteQuiz(quiz.documentId)}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
