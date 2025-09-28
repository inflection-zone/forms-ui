
import BloodOxygenSaturationForm from "./healthCare/BloodOxygenSaturation.svelte";
import BloodPressureForm from "./healthCare/BloodPressure.svelte";
import CholesterolForm from "./healthCare/Cholesterol.svelte";
import CReactiveProteinForm from "./healthCare/CReactiveProtein.svelte";
import ElectrolytesForm from "./healthCare/Electrolytes.svelte";
import GlucoseForm from "./healthCare/Glucose.svelte";
import HeightForm from "./healthCare/Height.svelte";
import HematocritForm from "./healthCare/Hematocrit.svelte";
import HemoglobinForm from "./healthCare/Hemoglobin.svelte";
import KidneyFunctionFaorm from "./healthCare/KidneyFunction.svelte";
import LipoproteinForm from "./healthCare/Lipoprotein.svelte";
import PulseRate from "./healthCare/PulseRate.svelte";
import RespiratoryRateForm from "./healthCare/RespiratoryRate.svelte";
import SleepForm from "./healthCare/Sleep.svelte";
import TemperatureForm from "./healthCare/Temperature.svelte";
import WaistForm from "./healthCare/Waist.svelte";
import WeightForm from "./healthCare/Weight.svelte";

import BooleanForm from "./basic/Boolean.svelte";
import CheckboxForm from "./basic/CheckBox.svelte";
import DateForm from "./basic/Date.svelte";
import DateTimeForm from "./basic/DateTime.svelte";
import FileForm from "./basic/File.svelte";
import FloatForm from "./basic/Float.svelte";
import IntegerForm from "./basic/Integer.svelte";
import ObjectForm from "./basic/Object.svelte";
import RadioForm from "./basic/Radio.svelte";
import RatingForm from "./basic/Rating.svelte";
import RangeForm from "./basic/Range.svelte";
import TextArrayForm from "./basic/TextArray.svelte";
import TextForm from "./basic/Text.svelte";

export const formComponents = {
    Text: TextForm,
    Integer: IntegerForm,
    Float: FloatForm,
    Boolean: BooleanForm,
    Object: ObjectForm,
    TextArray: TextArrayForm,
    SingleChoiceSelection: RadioForm,
    MultiChoiceSelection: CheckboxForm,
    File: FileForm,
    Date: DateForm,
    DateTime: DateTimeForm,
    Rating: RatingForm,
    Range: RangeForm,

    Temperature: TemperatureForm,
    BloodPressure: BloodPressureForm,
    Glucose: GlucoseForm,
    BloodOxygenSaturation: BloodOxygenSaturationForm,
    PulseRate: PulseRate,
    Hematocrit: HematocritForm,
    Cholesterol: CholesterolForm,
    Height: HeightForm,
    Weight: WeightForm,
    RespiratoryRate: RespiratoryRateForm,
    Electrolytes: ElectrolytesForm,
    KidneyFunction: KidneyFunctionFaorm,
    WaistCircumference: WaistForm,
    HemoglobinA1C: HemoglobinForm,
    Sleep: SleepForm,
    CReactiveProtein: CReactiveProteinForm,
    Lipoprotein: LipoproteinForm,
    // None: ''
};