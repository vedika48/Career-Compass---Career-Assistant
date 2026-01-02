import re
import json
from datetime import datetime
from app.ml_models.job_matcher import RealTimeJobMatcher
from app.ml_models.resume_optimizer import ResumeOptimizer
from app.ml_models.salary_predictor import SalaryPredictor, SalaryDataCollector, MarketAnalyzer
from flask import current_app
from bson import ObjectId

class ChatService:
    def __init__(self):
        self.job_matcher = RealTimeJobMatcher()
        self.resume_optimizer = ResumeOptimizer()
        
        # Initialize salary predictor with required dependencies
        self.data_collector = SalaryDataCollector()
        self.market_analyzer = MarketAnalyzer(self.data_collector)
        self.salary_predictor = SalaryPredictor(self.data_collector, self.market_analyzer)
        
        # Intent patterns for understanding user queries
        self.intent_patterns = {
            'job_search': [
                r'(?:find|search|look.*for).*job',
                r'job.*(?:opportunities|openings|vacancies)',
                r'(?:hiring|recruitment).*assistance',
                r'career.*opportunities',
                r'help.*get.*job',
                r'applying.*jobs'
            ],
            'salary': [
                r'salary.*(?:range|expectation|negotiation)',
                r'how.*much.*should.*earn',
                r'compensation.*package',
                r'pay.*scale',
                r'ctc.*package',
                r'negotiate.*offer'
            ],
            'resume': [
                r'resume.*(?:help|review|build|improve)',
                r'cv.*feedback',
                r'ats.*friendly',
                r'resume.*tips',
                r'how.*write.*resume',
                r'resume.*format'
            ],
            'interview': [
                r'interview.*(?:preparation|tips|questions)',
                r'how.*prepare.*interview',
                r'technical.*interview',
                r'hr.*round',
                r'behavioral.*questions',
                r'company.*interview'
            ],
            'company_research': [
                r'company.*(?:culture|review|environment)',
                r'work.*life.*balance',
                r'best.*companies',
                r'women.*friendly',
                r'maternity.*policies',
                r'work.*culture'
            ],
            'career_growth': [
                r'career.*(?:growth|development|advancement)',
                r'skill.*development',
                r'promotion.*opportunities',
                r'upskill.*learn',
                r'career.*change',
                r'next.*career.*step'
            ]
        }

    def process_message(self, message, user_id=None, context=None):
        """Process user message and generate appropriate response using actual data"""
        message_lower = message.lower().strip()
        
        # Detect intent from the entire sentence
        intent = self._detect_intent(message_lower)
        
        # Extract context from the full sentence
        extracted_context = self._extract_context(message_lower)
        
        response_data = {
            'message': '',
            'intent': intent,
            'context': extracted_context,
            'suggestions': [],
            'data': {},
            'timestamp': datetime.utcnow().isoformat()
        }
        
        try:
            # Generate response based on intent using real data
            if intent == 'job_search':
                response_data.update(self._handle_job_search(message_lower, extracted_context, user_id))
            elif intent == 'salary':
                response_data.update(self._handle_salary_query(message_lower, extracted_context, user_id))
            elif intent == 'resume':
                response_data.update(self._handle_resume_query(message_lower, extracted_context, user_id))
            elif intent == 'interview':
                response_data.update(self._handle_interview_query(message_lower, extracted_context, user_id))
            elif intent == 'company_research':
                response_data.update(self._handle_company_query(message_lower, extracted_context, user_id))
            elif intent == 'career_growth':
                response_data.update(self._handle_career_growth_query(message_lower, extracted_context, user_id))
            else:
                response_data.update(self._handle_general_query(message_lower, extracted_context, user_id))
                
            response_data['suggestions'] = self.get_follow_up_suggestions(intent, extracted_context)
            
        except Exception as e:
            current_app.logger.error(f"Error processing message: {str(e)}")
            response_data['message'] = f"I encountered an error while processing your request: {str(e)}"
            response_data['error'] = str(e)
            
        return response_data

    def _detect_intent(self, message):
        """Detect user intent from the entire message"""
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, message, re.IGNORECASE):
                    return intent
        return 'general'

    def _extract_context(self, message):
        """Extract context from the entire sentence"""
        return {
            'location': self._extract_location(message),
            'role': self._extract_role(message),
            'experience': self._extract_experience(message),
            'skills': self._extract_skills(message),
            'company': self._extract_company(message)
        }

    def _extract_location(self, message):
        """Extract location from message by querying database"""
        try:
            db = current_app.db
            if db:
                locations = db.jobs.distinct('location')
                for location in locations:
                    if location and location.lower() in message.lower():
                        return location
        except Exception as e:
            current_app.logger.error(f"Error extracting location: {str(e)}")
        return None

    def _extract_role(self, message):
        """Extract job role from message by querying database"""
        try:
            db = current_app.db
            if db:
                roles = db.jobs.distinct('title')
                for role in roles:
                    if role and role.lower() in message.lower():
                        return role
        except Exception as e:
            current_app.logger.error(f"Error extracting role: {str(e)}")
        return None

    def _extract_experience(self, message):
        """Extract experience from message"""
        exp_patterns = {
            'fresher': r'\b(?:fresher|recent graduate|0|no experience|entry level)\b',
            '0-2 years': r'\b(?:0-2|1-2|2 years?|junior)\b',
            '2-5 years': r'\b(?:2-5|3-5|mid level|mid-level)\b',
            '5+ years': r'\b(?:5\+|5-8|8\+|senior|lead|principal)\b'
        }
        
        for exp_level, pattern in exp_patterns.items():
            if re.search(pattern, message, re.IGNORECASE):
                return exp_level
        return None

    def _extract_skills(self, message):
        """Extract skills from message by querying database"""
        try:
            db = current_app.db
            if db:
                skills = db.jobs.distinct('skills')
                found_skills = []
                for skill in skills:
                    if skill and skill.lower() in message.lower():
                        found_skills.append(skill)
                return found_skills if found_skills else None
        except Exception as e:
            current_app.logger.error(f"Error extracting skills: {str(e)}")
        return None

    def _extract_company(self, message):
        """Extract company name from message by querying database"""
        try:
            db = current_app.db
            if db:
                companies = db.jobs.distinct('company')
                for company in companies:
                    if company and company.lower() in message.lower():
                        return company
        except Exception as e:
            current_app.logger.error(f"Error extracting company: {str(e)}")
        return None

    def _handle_job_search(self, message, context, user_id):
        """Handle job search using RealTimeJobMatcher"""
        try:
            # Get user profile to personalize recommendations
            user_profile = self._get_user_profile(user_id)
            
            # Use the job matcher to find relevant jobs
            if user_profile:
                recommendations = self.job_matcher.get_recommendations(
                    user_profile.get('skills', []),
                    user_profile.get('preferred_locations', []),
                    user_profile.get('experience', 0)
                )
            else:
                # Fallback to context-based search
                recommendations = self.job_matcher.search_jobs(
                    skills=context.get('skills', []),
                    location=context.get('location'),
                    role=context.get('role')
                )
            
            if recommendations and len(list(recommendations.clone())) > 0:
                jobs_list = list(recommendations.limit(5))
                
                response = f"I found {len(jobs_list)} relevant job opportunities"
                if context.get('role'):
                    response += f" for {context['role']} roles"
                if context.get('location'):
                    response += f" in {context['location']}"
                response += ":\n\n"
                
                for i, job in enumerate(jobs_list, 1):
                    response += f"{i}. **{job.get('title', 'N/A')}** at {job.get('company', 'N/A')}\n"
                    response += f"   Location: {job.get('location', 'N/A')}\n"
                    response += f"   Experience: {job.get('experience', 'N/A')}\n"
                    response += f"   Skills: {', '.join(job.get('skills', []))}\n\n"
                
                response += "Would you like me to provide more details about any of these positions or help you with the application process?"
                
                return {
                    'message': response,
                    'data': {
                        'jobs': jobs_list,
                        'total_count': len(jobs_list)
                    }
                }
            else:
                return {
                    'message': "I couldn't find specific job matches based on your query. Let me help you refine your search. Could you tell me more about your skills, preferred location, or target roles?",
                    'data': {'jobs': []}
                }
                
        except Exception as e:
            current_app.logger.error(f"Job search error: {str(e)}")
            return {
                'message': f"I'm having trouble accessing job data right now. Error: {str(e)}",
                'error': str(e)
            }

    def _handle_salary_query(self, message, context, user_id):
        """Handle salary queries using SalaryPredictor"""
        try:
            # Use the salary predictor to get actual data
            if context.get('role') and context.get('location'):
                prediction = self.salary_predictor.predict(
                    role=context['role'],
                    location=context['location'],
                    experience=self._experience_to_years(context.get('experience'))
                )
                
                if prediction:
                    response = f"Based on current market data for {context['role']} in {context['location']}:\n\n"
                    response += f"**Estimated Salary Range:** ₹{prediction.get('min_salary', 'N/A')} - ₹{prediction.get('max_salary', 'N/A')} per year\n"
                    response += f"**Median Salary:** ₹{prediction.get('median_salary', 'N/A')} per year\n"
                    response += f"**Experience Level:** {context.get('experience', 'Not specified')}\n\n"
                    
                    # Add market insights
                    insights = self.market_analyzer.get_market_insights(
                        context['role'], 
                        context['location']
                    )
                    if insights:
                        response += "**Market Insights:**\n"
                        for insight in insights.get('trends', [])[:3]:
                            response += f"• {insight}\n"
                    
                    return {
                        'message': response,
                        'data': {
                            'salary_prediction': prediction,
                            'market_insights': insights
                        }
                    }
            
            # Fallback if not enough context
            return {
                'message': "To provide accurate salary information, I need to know the role and location you're interested in. Could you specify what position and city you're asking about?",
                'data': {}
            }
            
        except Exception as e:
            current_app.logger.error(f"Salary query error: {str(e)}")
            return {
                'message': f"I'm having trouble accessing salary data right now. Error: {str(e)}",
                'error': str(e)
            }

    def _handle_resume_query(self, message, context, user_id):
        """Handle resume queries using ResumeOptimizer"""
        try:
            # Get user's resume data if available
            user_profile = self._get_user_profile(user_id)
            
            if 'review' in message or 'feedback' in message:
                if user_profile and user_profile.get('resume_text'):
                    # Use resume optimizer for actual analysis
                    analysis = self.resume_optimizer.analyze_resume(user_profile['resume_text'])
                    response = f"Based on your resume analysis:\n\n"
                    response += f"**ATS Score:** {analysis.get('ats_score', 'N/A')}/100\n"
                    response += f"**Key Strengths:** {', '.join(analysis.get('strengths', []))}\n"
                    response += f"**Areas for Improvement:** {', '.join(analysis.get('improvements', []))}\n\n"
                    response += "Would you like specific suggestions for improvement?"
                else:
                    response = "I can help you review and optimize your resume! Please upload your resume or share your key details like skills, experience, and target roles for personalized feedback."
                
                return {
                    'message': response,
                    'data': {
                        'can_analyze': user_profile and user_profile.get('resume_text') is not None
                    }
                }
            else:
                return {
                    'message': "I can help you with resume building, ATS optimization, and personalized feedback. Would you like me to review your existing resume or help you create a new one?",
                    'data': {}
                }
                
        except Exception as e:
            current_app.logger.error(f"Resume query error: {str(e)}")
            return {
                'message': f"I'm having trouble accessing resume analysis tools right now. Error: {str(e)}",
                'error': str(e)
            }

    def _handle_interview_query(self, message, context, user_id):
        """Handle interview preparation queries using actual data"""
        try:
            db = current_app.db
            if not db:
                raise Exception("Database not available")
                
            company = context.get('company')
            role = context.get('role')
            
            # Query interview questions from database
            query = {}
            if company:
                query['company'] = {'$regex': company, '$options': 'i'}
            if role:
                query['role'] = {'$regex': role, '$options': 'i'}
            
            questions = list(db.interview_questions.find(query).limit(10))
            
            if questions:
                response = f"Here are some interview questions"
                if company:
                    response += f" for {company}"
                if role:
                    response += f" for {role} roles"
                response += ":\n\n"
                
                for i, q in enumerate(questions, 1):
                    response += f"{i}. {q.get('question', 'N/A')}\n"
                    if q.get('type'):
                        response += f"   Type: {q['type']}\n"
                    response += "\n"
                
                return {
                    'message': response,
                    'data': {
                        'questions': questions,
                        'total_questions': len(questions)
                    }
                }
            else:
                return {
                    'message': "I can help you with interview preparation! Could you specify the company or role you're preparing for? I can provide technical questions, behavioral questions, and company-specific tips.",
                    'data': {}
                }
                
        except Exception as e:
            current_app.logger.error(f"Interview query error: {str(e)}")
            return {
                'message': f"I can provide general interview preparation tips. For technical roles, focus on data structures and algorithms. For behavioral interviews, prepare STAR method examples. Database error: {str(e)}",
                'error': str(e)
            }

    def _handle_company_query(self, message, context, user_id):
        """Handle company research queries using actual data"""
        try:
            db = current_app.db
            if not db:
                raise Exception("Database not available")
                
            company = context.get('company')
            
            if company:
                # Query company data from database
                company_data = db.companies.find_one({
                    'name': {'$regex': company, '$options': 'i'}
                })
                
                if company_data:
                    response = f"Here's what I found about {company_data.get('name', company)}:\n\n"
                    response += f"**Industry:** {company_data.get('industry', 'N/A')}\n"
                    response += f"**Size:** {company_data.get('size', 'N/A')} employees\n"
                    response += f"**Location:** {company_data.get('headquarters', 'N/A')}\n\n"
                    
                    if company_data.get('culture'):
                        response += "**Company Culture:**\n"
                        for aspect in company_data['culture'][:3]:
                            response += f"• {aspect}\n"
                    
                    if company_data.get('benefits'):
                        response += "\n**Key Benefits:**\n"
                        for benefit in company_data['benefits'][:3]:
                            response += f"• {benefit}\n"
                    
                    return {
                        'message': response,
                        'data': {
                            'company': company_data
                        }
                    }
            
            return {
                'message': "I can help you research companies! Please specify which company you're interested in, and I'll provide information about their culture, benefits, work environment, and reviews.",
                'data': {}
            }
            
        except Exception as e:
            current_app.logger.error(f"Company query error: {str(e)}")
            return {
                'message': f"I'm having trouble accessing company data right now. Error: {str(e)}",
                'error': str(e)
            }

    def _handle_career_growth_query(self, message, context, user_id):
        """Handle career growth queries using personalized recommendations"""
        try:
            user_profile = self._get_user_profile(user_id)
            current_role = context.get('role') or (user_profile.get('current_role') if user_profile else None)
            
            if current_role:
                # Query career paths from database
                db = current_app.db
                if db:
                    career_path = db.career_paths.find_one({
                        'current_role': {'$regex': current_role, '$options': 'i'}
                    })
                    
                    if career_path:
                        response = f"Based on your current role as {current_role}, here are potential career growth paths:\n\n"
                        
                        response += "**Next Steps:**\n"
                        for step in career_path.get('next_roles', [])[:3]:
                            response += f"• {step}\n"
                        
                        response += "\n**Recommended Skills to Learn:**\n"
                        for skill in career_path.get('skills_to_learn', [])[:5]:
                            response += f"• {skill}\n"
                        
                        if career_path.get('timeline'):
                            response += f"\n**Typical Timeline:** {career_path['timeline']}\n"
                        
                        return {
                            'message': response,
                            'data': {
                                'career_path': career_path
                            }
                        }
            
            return {
                'message': "I can help you plan your career growth! Could you tell me your current role and what kind of career direction you're interested in? I can suggest skills to learn, potential career paths, and growth opportunities.",
                'data': {}
            }
            
        except Exception as e:
            current_app.logger.error(f"Career growth query error: {str(e)}")
            return {
                'message': f"For career growth, focus on continuous learning, networking, and taking on challenging projects. Database error: {str(e)}",
                'error': str(e)
            }

    def _handle_general_query(self, message, context, user_id):
        """Handle general queries"""
        return {
            'message': "I'm here to help you with your career journey in India! I can assist with:\n\n"
                      "• **Job Search**: Finding opportunities, company research, application strategies\n"
                      "• **Salary Insights**: Market rates, compensation analysis, negotiation tips\n"
                      "• **Resume Help**: ATS optimization, review, and building guidance\n"
                      "• **Interview Prep**: Technical and behavioral question practice\n"
                      "• **Company Research**: Culture, benefits, work environment insights\n"
                      "• **Career Growth**: Skill development, career path planning\n\n"
                      "What specific area would you like help with today?",
            'data': {}
        }

    def _get_user_profile(self, user_id):
        """Get user profile from database"""
        if not user_id:
            return None
            
        try:
            db = current_app.db
            if db:
                user = db.users.find_one({'_id': ObjectId(user_id)})
                return user
        except Exception as e:
            current_app.logger.error(f"Error getting user profile: {str(e)}")
        return None

    def _experience_to_years(self, experience_str):
        """Convert experience string to years"""
        if not experience_str:
            return 0
            
        if 'fresher' in experience_str.lower():
            return 0
        elif '0-2' in experience_str:
            return 1
        elif '2-5' in experience_str:
            return 3
        elif '5+' in experience_str:
            return 6
        else:
            return 0

    def get_follow_up_suggestions(self, intent, context):
        """Generate context-aware follow-up suggestions"""
        base_suggestions = {
            'job_search': [
                "Show me remote job opportunities",
                "Find jobs with specific skills",
                "Help me prepare for applications",
                "Compare companies"
            ],
            'salary': [
                "Compare salaries across cities",
                "Negotiation strategies",
                "Benefits to ask for",
                "Industry salary trends"
            ],
            'resume': [
                "Review my resume",
                "ATS optimization tips",
                "Resume templates",
                "Key achievements examples"
            ],
            'interview': [
                "Technical interview practice",
                "Behavioral questions",
                "Company-specific tips",
                "Interview follow-up"
            ],
            'company_research': [
                "Company culture details",
                "Employee benefits",
                "Growth opportunities",
                "Work-life balance"
            ],
            'career_growth': [
                "Skill development plan",
                "Certification recommendations",
                "Networking strategies",
                "Career transition advice"
            ],
            'general': [
                "Find software engineer jobs",
                "Salary negotiation tips",
                "Resume building help",
                "Interview preparation"
            ]
        }
        
        return base_suggestions.get(intent, base_suggestions['general'])