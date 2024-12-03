import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Modal Component
const Modal = ({ isOpen, onClose, totalScore, individualScores, complianceRequirements, riskLevels, penalties, gaps, recommendations }) =>
{
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white p-8 rounded-lg shadow-[5px_5px_0px_0px_rgba(20,3,95,1)] w-3/4 max-w-4xl my-8">
                <h2 className="text-2xl font-bold mb-4 text-primary text-center">Your Results</h2>
                <p className="text-lg mb-4 text-primary text-center">
                    Total Score: <span className="font-bold">{totalScore}</span>
                </p>
                <h3 className="text-lg font-semibold mb-2 text-primary">Individual Scores:</h3>
                <ul className="list-disc list-inside mb-4 text-primary">
                    {individualScores.map((score, index) => (
                        <li key={index} className="mb-4">
                            <strong>Question {index + 1}:</strong> <span className="font-medium">{score}</span> <br />
                            <strong>Compliance Requirement:</strong> {complianceRequirements[index]} <br />
                            <strong>Risk Level:</strong> {riskLevels[index]} <br />
                            <strong>Penalty:</strong> {penalties[index]} <br />
                            <strong>Gap:</strong> {gaps[index]} <br />
                            <strong>Recommendation:</strong> {recommendations[index]}
                        </li>
                    ))}
                </ul>
                <button onClick={onClose} className="block mx-auto bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-all">
                    Close
                </button>
            </div>
        </div>
    );
};

const ViewQuiz = () =>
{
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [finalScore, setFinalScore] = useState(0);
    const [individualScores, setIndividualScores] = useState([]);
    const [complianceRequirements, setComplianceRequirements] = useState([]);
    const [riskLevels, setRiskLevels] = useState([]);
    const [penalties, setPenalties] = useState([]);
    const [gaps, setGaps] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() =>
    {
        const fetchQuiz = async () =>
        {
            const documentId = window.location.pathname.split('/').pop();
            if (!documentId)
            {
                setError("Quiz documentId is missing from the URL");
                setLoading(false);
                return;
            }

            try
            {
                const url = `https://api.ethiai.io/api/quizzes?filters[documentId][$eq]=${documentId}&populate[questions][populate]=options`;
                const response = await fetch(url);
                if (!response.ok)
                {
                    throw new Error(`Quiz with documentId ${documentId} not found`);
                }
                const result = await response.json();
                if (result.data.length > 0)
                {
                    setQuiz(result.data[0]);
                } else
                {
                    throw new Error(`No quiz found with documentId ${documentId}`);
                }
            } catch (err)
            {
                setError(err.message || 'An unknown error occurred');
            } finally
            {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, []);

    const calculateRiskRanking = (selectedOptions, questionType) =>
    {
        if (questionType === 'Radio button')
        {
            return selectedOptions[0]?.riskScore || 0;
        } else
        {
            const n = selectedOptions.length;
            let riskRanking = 0;

            if (n === 0) return 0;

            for (let i = 1; i <= n; i++)
            {
                const combinationsCount = factorial(n) / (factorial(i) * factorial(n - i));
                riskRanking += combinationsCount;
            }

            return riskRanking;
        }
    };

    const factorial = (num) =>
    {
        return num <= 1 ? 1 : num * factorial(num - 1);
    };

    const handleAnswerChange = (questionId, optionId, questionType, checked) =>
    {
        setUserAnswers((prev) =>
        {
            const currentAnswers = prev[questionId] || { answers: [], riskRanking: 0 };

            let updatedAnswers;
            if (questionType === 'Radio button')
            {
                updatedAnswers = [optionId];
            } else
            {
                updatedAnswers = checked
                    ? [...currentAnswers.answers, optionId]
                    : currentAnswers.answers.filter((id) => id !== optionId);
            }

            const options = quiz?.questions.find(q => q.id === questionId)?.options.filter(opt => updatedAnswers.includes(opt.id.toString())) || [];
            const riskRanking = calculateRiskRanking(options, questionType);

            return {
                ...prev,
                [questionId]: { answers: updatedAnswers, riskRanking },
            };
        });
    };

    const handleNextQuestion = () =>
    {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    };

    const handleNextOrSubmit = async (event) =>
    {
        event.preventDefault();

        if (!quiz) return;

        if (currentQuestionIndex === quiz.questions.length - 1)
        {
            // Calculate total risk ranking and individual scores
            const totalRiskRanking = Object.values(userAnswers).reduce((acc, answer) =>
            {
                return acc + (parseFloat(answer.riskRanking.toString()) || 0);
            }, 0);
            const scores = Object.values(userAnswers).map(answer => parseFloat(answer.riskRanking.toString()) || 0);

            const complianceReqs = quiz.questions.map(q => q.ComplianceRequirement);
            const riskLvls = quiz.questions.map(q => q.RiskLevel);
            const penaltiesList = quiz.questions.map(q => q.Penalty);

            // Extract gaps and recommendations
            const gapsList = [];
            const recommendationsList = [];

            quiz.questions.forEach((question) =>
            {
                const selectedOptionIds = userAnswers[question.id]?.answers || [];
                const selectedOptions = question.options.filter(opt => selectedOptionIds.includes(opt.id.toString()));

                const gaps = selectedOptions.map(opt => opt.gaps).join(', ') || 'No gaps identified';
                const recommendation = selectedOptions.map(opt => opt.recommendation).join(', ') || 'No recommendation available';

                gapsList.push(gaps);
                recommendationsList.push(recommendation);
            });

            // Set results for the modal
            setFinalScore(totalRiskRanking);
            setIndividualScores(scores);
            setComplianceRequirements(complianceReqs);
            setRiskLevels(riskLvls);
            setPenalties(penaltiesList);
            setGaps(gapsList);
            setRecommendations(recommendationsList);
            setModalOpen(true);

            // Prepare and submit answers
            const documentId = window.location.pathname.split('/').pop();

            for (const question of quiz.questions)
            {
                const selectedOptions = userAnswers[question.id]?.answers.map(answer => parseInt(answer)) || [];
                const payload = {
                    data: {
                        quiz: parseInt(documentId || '0'),
                        options: selectedOptions,
                        question: question.id,
                        locale: 'en'
                    }
                };

                try
                {
                    const response = await fetch('https://api.ethiai.io/api/answers?populate=*', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });

                    if (!response.ok)
                    {
                        throw new Error(`Failed to submit answer for question ${question.id}`);
                    }
                    const data = await response.json();
                    console.log('Submission successful for question:', question.id, data);
                } catch (error)
                {
                    console.error('Error submitting answer for question:', question.id, error);
                }
            }
        } else
        {
            // If not the last question, move to the next question
            handleNextQuestion();
        }
    };

    const closeModal = () =>
    {
        setModalOpen(false);
        navigate('/evaluation', {
            state: {
                totalRiskRanking: finalScore,
                individualScores,
                complianceRequirements,
                riskLevels,
                penalties,
                gaps,
                recommendations
            }
        });
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (error)
        return (
            <div className="text-center mt-8">
                <p className="text-red-600">Error: {error}</p>
                <p className="mt-4">Please check the following:</p>
                <ul className="list-disc list-inside">
                    <li>The quiz ID in the URL is correct</li>
                    <li>Your backend server is running at http://localhost:1337</li>
                </ul>
            </div>
        );

    return (
        <div className="px-4 py-8">
            {quiz && (
                <>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold">{quiz.title}</h2>
                    </div>
                    <form onSubmit={handleNextOrSubmit}>
                        {quiz.questions.slice(currentQuestionIndex, currentQuestionIndex + 1).map((question, index) => (
                            <div key={question.id} className="mb-8">
                                <div className="text-xl font-semibold text-primary mb-4">{question.name}</div>
                                <div>
                                    {question.options.map((option) => (
                                        <div key={option.id} className="mb-4">
                                            <label className="inline-flex items-center text-primary">
                                                {question.type === 'Checkbox' ? (
                                                    <input
                                                        type="checkbox"
                                                        className="form-checkbox"
                                                        checked={userAnswers[question.id]?.answers.includes(option.id.toString())}
                                                        onChange={(e) => handleAnswerChange(question.id, option.id, question.type, e.target.checked)}
                                                    />
                                                ) : (
                                                    <input
                                                        type="radio"
                                                        name={`question-${question.id}`}
                                                        className="form-radio"
                                                        checked={userAnswers[question.id]?.answers.includes(option.id.toString())}
                                                        onChange={() => handleAnswerChange(question.id, option.id, question.type, true)}
                                                    />
                                                )}
                                                <span className="ml-2">{option.label}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition-all"
                            >
                                {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
                            </button>
                        </div>
                    </form>
                </>
            )}
            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                totalScore={finalScore}
                individualScores={individualScores}
                complianceRequirements={complianceRequirements}
                riskLevels={riskLevels}
                penalties={penalties}
                gaps={gaps}
                recommendations={recommendations}
            />
        </div>
    );
};

export default ViewQuiz;
