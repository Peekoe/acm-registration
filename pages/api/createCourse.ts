import { prisma } from '../../lib/prisma';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

type CourseDTO = {
  section: number,
  semester: string;
  userId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = JSON.parse(req.body);
  let courses: CourseDTO[] = body.courses;
  let nameAndMajors = parseCourseName(body.course);

  for (let i = 0; i < courses.length; i++) {
    let [name, major] = nameAndMajors[i];
    let course = courses[i];

    const courseCode = await prisma.courseCode.findFirst({
      where: {
        major: {
          equals: major
        },
        name: {
          equals: name
        }
      },
    });

    if (courseCode === null) {
      console.error("Course code could not be found");
    } else {
      await prisma.course.create({
        data: {
          section: course.section,
          semester: course.semester,
          userId: course.userId,
          courseId: courseCode.id,
        },
      });
    }
  }
}

function parseCourseName(courses: string[]): [string, string][] {
  let results: [string, string][] = [];
  
  courses.forEach(course => {
    let name = course.split(/[0-9]/)[0];
    let num =  parseInt(course[3]) === NaN ? course.substring(4) : course.substring(3);
    results.push([name, num]);
  });
  
  return results;
}