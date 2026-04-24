import { SemesterSubjectRepository } from "./repository/semester-subject.repository.js";
import { SemesterSubjectService } from "./service/semester-subject.service.js";
import { SemesterSubjectController } from "./semester-subject.controller.js";

const semesterSubjectRepository = new SemesterSubjectRepository();
const semesterSubjectService = new SemesterSubjectService(semesterSubjectRepository);
const semesterSubjectController = new SemesterSubjectController(semesterSubjectService);

export {
    semesterSubjectRepository,
    semesterSubjectService,
    semesterSubjectController,
};
